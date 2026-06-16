'use server'

import { SensorState } from '../../core/entities/Sensor';
import { logAction } from './auditActions';
import { z } from 'zod';
import { getSensorRepository } from '../di/container';
import { cookies } from 'next/headers';
import { verifyToken, TokenPayload } from '@/lib/auth';
import { db } from '../database/db';
import { devices } from '../database/schema';
import { eq } from 'drizzle-orm';
import { sendEmail } from '@/lib/email/mailer';
import { MonthlyReportEmailTemplate } from '@/emails/MonthlyReportEmailTemplate';
import React from 'react';
import { getReports } from './historyActions';
import { calculateReportMetrics, HistoryDataPoint } from '@/core/use-cases/reportsEngine';
const UpdateSensorSchema = z.object({
  devEui: z.string().min(1),
  name: z.string().min(1).max(100),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  notificationEmail: z.string().email().nullable().optional().or(z.literal('')),
  notificationsEnabled: z.boolean().optional()
});

async function requireSession(): Promise<TokenPayload> {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) throw new Error('No autorizado. Sesión expirada o inválida.');
  const session = verifyToken(token);
  if (!session) throw new Error('No autorizado.');
  return session;
}

async function requireAdminSession(): Promise<TokenPayload> {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) throw new Error('No autorizado. Sesión expirada o inválida.');
  const session = verifyToken(token);
  if (!session || session.role !== 'ADMIN') throw new Error('No autorizado. Requiere rol de Administrador.');
  return session;
}

export async function getSensors(): Promise<SensorState[]> {
  await requireSession();
  try {
    return await getSensorRepository().getSensors();
  } catch (error) {
    console.error('Error in getSensors action:', error);
    throw new Error('Error al cargar sensores. Verifique la conexión con la base de datos.');
  }
}

export async function updateSensor(
  devEui: string,
  name: string,
  latitude: number | null,
  longitude: number | null,
  notificationEmail?: string | null,
  notificationsEnabled?: boolean
) {
  const session = await requireAdminSession();

  try {
    const validated = UpdateSensorSchema.parse({ devEui, name, latitude, longitude, notificationEmail, notificationsEnabled });
    
    const sensors = await getSensorRepository().getSensors();
    const currentSensor = sensors.find(s => s.devEui === validated.devEui || s.id === validated.devEui);
    
    let monthlyReportConfiguredAt: Date | null | undefined = undefined;
    
    if (validated.notificationsEnabled && (!currentSensor?.notificationsEnabled || currentSensor?.notificationEmail !== validated.notificationEmail)) {
       monthlyReportConfiguredAt = new Date();
    } else if (!validated.notificationsEnabled || !validated.notificationEmail) {
       monthlyReportConfiguredAt = null; // Reset if disabled
    }

    await getSensorRepository().updateSensor(validated.devEui, {
      name: validated.name,
      latitude: validated.latitude,
      longitude: validated.longitude,
      notificationEmail: validated.notificationEmail || null,
      notificationsEnabled: validated.notificationsEnabled || false,
      monthlyReportConfiguredAt
    });
    
    await logAction(session.id, session.username, 'UPDATE_SENSOR', `Actualizado sensor ${validated.devEui}: ${validated.name}`);
    return { success: true };
  } catch (error) {
    console.error('updateSensor Action Error:', error);
    throw new Error('Error al actualizar el sensor');
  }
}

export async function deleteSensorMeasurements(
  devEui: string
) {
  const session = await requireAdminSession();

  try {
    await getSensorRepository().deleteSensorMeasurements(devEui);
    await logAction(session.id, session.username, 'DELETE_MEASUREMENTS', `Borrado historial del sensor ${devEui}`);
    return { success: true };
  } catch (error) {
    console.error('deleteSensorMeasurements Action Error:', error);
    throw new Error('Error al borrar el historial del sensor');
  }
}

export async function deleteSensor(
  devEui: string, 
  includeHistory: boolean = false
) {
  const session = await requireAdminSession();

  try {
    await getSensorRepository().deleteSensor(devEui, includeHistory);
    await logAction(session.id, session.username, 'DELETE_SENSOR', `Eliminado sensor ${devEui} ${includeHistory ? '(incluyendo historial)' : ''}`);
    return { success: true };
  } catch (error) {
    console.error('deleteSensor Action Error:', error);
    throw new Error('Error al eliminar el sensor');
  }
}

export async function sendManualMonthlyReport(devEui: string) {
  const session = await requireAdminSession();

  try {
    const eligibleDevices = await db.select().from(devices).where(eq(devices.devEui, devEui));
    if (eligibleDevices.length === 0 || !eligibleDevices[0].notificationEmail) {
      throw new Error('Sensor no encontrado o sin email configurado');
    }

    const device = eligibleDevices[0];
    const reportsRaw = await getReports(30, device.devEui);
        
    const historyData: HistoryDataPoint[] = reportsRaw.map(r => ({
      timestamp: new Date(r.timestamp),
      temperature: r.temperature,
      humidity: r.humidity,
      co2: r.co2,
      presence: r.presence,
      deviceId: r.deviceId
    }));

    const { percentages, totalHours, metrics } = calculateReportMetrics(historyData, 'all');

    if (totalHours === 0 || !device.notificationEmail) {
      throw new Error('No hay datos suficientes para generar un reporte del último mes.');
    }

    const red = percentages[2] + percentages[3] + percentages[4];
    const orange = percentages[5] + percentages[6] + percentages[7] + percentages[8];
    const green = percentages[9];
    const gray = percentages[1] + percentages[0];

    const chartConfig = {
      type: 'doughnut',
      data: {
        labels: ['Crítico', 'Riesgo / Aviso', 'Ideal', 'Desconectado'],
        datasets: [{
          data: [red.toFixed(1), orange.toFixed(1), green.toFixed(1), gray.toFixed(1)],
          backgroundColor: ['#ef4444', '#f97316', '#10b981', '#64748b']
        }]
      },
      options: {
        plugins: {
          datalabels: { display: false }
        }
      }
    };

    const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}`;

    const result = await sendEmail({
      to: [device.notificationEmail],
      subject: `📊 Informe Mensual: ${device.name || device.devEui}`,
      react: React.createElement(MonthlyReportEmailTemplate, {
        sensorName: device.name || device.devEui,
        devEui: device.devEui,
        totalHours,
        metrics,
        percentages: {
          ideal: green,
          warning: orange,
          critical: red,
          offline: gray
        },
        rawPercentages: percentages,
        chartUrl,
      }),
    });

    if (!result.success) {
      throw new Error('No se pudo enviar el correo.');
    }

    await logAction(session.id, session.username, 'SEND_MONTHLY_REPORT', `Reporte mensual enviado manualmente para el sensor ${devEui}`);
    return { success: true };
  } catch (error: any) {
    console.error('sendManualMonthlyReport Action Error:', error);
    throw new Error(error.message || 'Error al enviar el reporte manual');
  }
}
