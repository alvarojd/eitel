'use server'

import { getHistoryRepository } from '../di/container';
import { z } from 'zod';

const DateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)').optional();

const ReportsParamsSchema = z.object({
  days: z.number().int().positive(),
  devEui: z.string().optional(),
});

const ExportCSVSchema = z.object({
  deviceIds: z.array(z.string().min(1)).min(1),
  startDate: DateStringSchema,
  endDate: DateStringSchema,
  allData: z.boolean().default(false),
});

export async function getSensorHistory(deviceId: string) {
  const historyRepository = getHistoryRepository();
  try {
    const rows = await historyRepository.getSensorHistory(deviceId);

    return rows.map(row => ({
      time: new Date(row.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Madrid' }),
      value: parseFloat(row.temperature),
      humidity: parseFloat(row.humidity),
      co2: parseFloat(row.co2) || 0,
      timestamp: new Date(row.created_at).toISOString()
    }));
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
}

export async function getReports(days: number, devEui?: string) {
  const historyRepository = getHistoryRepository();
  try {
    ReportsParamsSchema.parse({ days, devEui });
    const rows = await historyRepository.getReports(days, devEui);

    return rows.map(r => ({
      timestamp: r.timestamp,
      temperature: parseFloat(r.temperature) || 0,
      humidity: parseFloat(r.humidity) || 0,
      co2: Math.round(parseFloat(r.co2)) || 0,
      presence: r.presence === true,
      deviceId: r.dev_eui
    }));
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
}

export async function exportSensorDataCSV(deviceIds: string[], startDate?: string, endDate?: string, allData: boolean = false) {
  const historyRepository = getHistoryRepository();
  try {
    ExportCSVSchema.parse({ deviceIds, startDate, endDate, allData });
    const rows = await historyRepository.getExportData(deviceIds, startDate, endDate, allData);

    const headers = ["Fecha", "ID Dispositivo", "Nombre Sensor", "Temperatura (°C)", "Humedad (%)", "CO2 (ppm)", "Presencia"];
    let csvContent = headers.join(';') + '\n';

    for (const r of rows) {
      csvContent += [
        new Date(r.created_at).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }),
        r.dev_eui,
        r.device_name || '',
        r.temperature,
        r.humidity,
        r.co2 || '',
        r.presence ? 'SÍ' : 'NO'
      ].join(';') + '\n';
    }

    return csvContent;
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw new Error('Error al generar el reporte CSV');
  }
}
