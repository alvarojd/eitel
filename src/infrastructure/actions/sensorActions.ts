'use server'

import { SensorState } from '../../core/entities/Sensor';
import { logAction } from './auditActions';
import { z } from 'zod';
import { getSensorRepository } from '../di/container';
import { cookies } from 'next/headers';
import { verifyToken, TokenPayload } from '@/lib/auth';

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
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cron/monthly-reports?devEui=${devEui}`, {
      method: 'GET',
      headers: {
        'authorization': `Bearer ${process.env.CRON_SECRET || ''}`
      }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al enviar el reporte manualmente');
    }

    await logAction(session.id, session.username, 'SEND_MONTHLY_REPORT', `Reporte mensual enviado manualmente para el sensor ${devEui}`);
    return { success: true };
  } catch (error: any) {
    console.error('sendManualMonthlyReport Action Error:', error);
    throw new Error(error.message || 'Error al enviar el reporte manual');
  }
}
