'use server'

import { sql } from '../database/db';
import { SensorState, SensorStatus } from '../../core/entities/Sensor';
import { logAction } from './auditActions';
import { z } from 'zod';

const UpdateSensorSchema = z.object({
  devEui: z.string().min(1),
  name: z.string().min(1).max(100),
  latitude: z.number().nullable(),
  longitude: z.number().nullable()
});

export async function getSensors(): Promise<SensorState[]> {
  try {
    const { rows } = await sql`
      WITH latest_recs AS (
        SELECT DISTINCT ON (d.dev_eui) 
          d.dev_eui, d.device_id, d.name, d.battery, d.rssi, d.snr, d.latitude, d.longitude, d.gateway_id, d.created_at as registered_at,
          m.temperature, m.humidity, m.co2, m.presence, m.estado_id, m.created_at as measured_at
        FROM devices d
        LEFT JOIN measurements m ON d.dev_eui = m.dev_eui
        ORDER BY d.dev_eui, m.created_at DESC
      )
      SELECT 
        l.*,
        EXISTS(
          SELECT 1 FROM measurements m3 
          WHERE m3.dev_eui = l.dev_eui 
          AND m3.presence = true 
          AND m3.created_at > NOW() - INTERVAL '48 hour'
        ) as has_recent_presence
      FROM latest_recs l;
    `;

    const now = new Date();
    
    return rows.map(row => {
      const measuredTime = row.measured_at ? new Date(row.measured_at).getTime() : 0;
      const diffMs = measuredTime ? now.getTime() - measuredTime : Infinity;
      const diffMins = measuredTime ? Math.floor(diffMs / 60000) : Infinity;

      let final_estado_id = row.estado_id !== null ? row.estado_id : SensorStatus.OFFLINE;
      if (diffMins > 120) {
        final_estado_id = SensorStatus.OFFLINE; // Desconectado / Inactivo
      }

      return {
        id: row.dev_eui || row.device_id,
        devEui: row.dev_eui,
        name: row.name || row.device_id,
        latitude: row.latitude ? parseFloat(row.latitude) : undefined,
        longitude: row.longitude ? parseFloat(row.longitude) : undefined,
        gatewayId: row.gateway_id,
        registeredAt: row.registered_at,
        lastSeen: row.measured_at ? new Date(row.measured_at) : undefined,
        estadoId: final_estado_id,
        latestMeasurement: row.measured_at ? {
           sensorId: row.dev_eui || row.device_id,
           timestamp: new Date(row.measured_at),
           temperature: parseFloat(row.temperature),
           humidity: parseFloat(row.humidity),
           co2: row.co2,
           battery: row.battery,
           presence: row.presence,
           rssi: row.rssi,
           snr: parseFloat(row.snr || '0')
        } : undefined,
        indicators: {
          lowBattery: (row.battery || 0) < 20,
          longTermNoOccupancy: !row.has_recent_presence
        }
      };
    });

  } catch (error) {
    console.error('Error in getSensors action:', error);
    return [];
  }
}

export async function updateSensor(
  adminId: string,
  adminUsername: string,
  devEui: string,
  name: string,
  latitude: number | null,
  longitude: number | null
) {
  try {
    const validated = UpdateSensorSchema.parse({ devEui, name, latitude, longitude });
    
    await sql`
      UPDATE devices 
      SET 
        name = ${validated.name}, 
        latitude = ${validated.latitude}, 
        longitude = ${validated.longitude}
      WHERE dev_eui = ${validated.devEui.toUpperCase()}
    `;
    
    await logAction(adminId, adminUsername, 'UPDATE_SENSOR', `Actualizado sensor ${validated.devEui}: ${validated.name} (${validated.latitude}, ${validated.longitude})`);
    return { success: true };
  } catch (error) {
    console.error('updateSensor Action Error:', error);
    throw new Error('Error al actualizar el sensor');
  }
}

export async function deleteSensorMeasurements(
  adminId: string,
  adminUsername: string,
  devEui: string
) {
  try {
    const devEuiStr = devEui.toUpperCase();
    await sql`DELETE FROM measurements WHERE dev_eui = ${devEuiStr}`;
    
    await logAction(adminId, adminUsername, 'DELETE_MEASUREMENTS', `Borrado historial del sensor ${devEui}`);
    return { success: true };
  } catch (error) {
    console.error('deleteSensorMeasurements Action Error:', error);
    throw new Error('Error al borrar el historial del sensor');
  }
}

export async function deleteSensor(
  adminId: string,
  adminUsername: string,
  devEui: string, 
  includeHistory: boolean = false
) {
  try {
    const devEuiStr = devEui.toUpperCase();
    if (includeHistory) {
      await sql`DELETE FROM measurements WHERE dev_eui = ${devEuiStr}`;
    }
    
    await sql`DELETE FROM devices WHERE dev_eui = ${devEuiStr}`;
    
    await logAction(adminId, adminUsername, 'DELETE_SENSOR', `Eliminado sensor ${devEui} ${includeHistory ? '(incluyendo historial)' : ''}`);
    return { success: true };
  } catch (error) {
    console.error('deleteSensor Action Error:', error);
    throw new Error('Error al eliminar el sensor');
  }
}
