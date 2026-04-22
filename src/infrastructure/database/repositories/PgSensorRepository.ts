import { SensorRepository } from '../../../core/repositories/SensorRepository';
import { SensorState, SensorStatus } from '../../../core/entities/Sensor';
import { sql } from '../db';

export class PgSensorRepository implements SensorRepository {
  
  async getSensors(): Promise<SensorState[]> {
    const { rows } = await sql`
      SELECT 
        d.dev_eui, d.device_id, d.name, d.battery, d.rssi, d.snr, d.latitude, d.longitude, d.gateway_id, d.created_at as registered_at,
        d.temperature, d.humidity, d.co2, d.presence, d.estado_id, d.last_measured_at as measured_at,
        EXISTS(
          SELECT 1 FROM measurements m3 
          WHERE m3.dev_eui = d.dev_eui 
          AND m3.presence = true 
          AND m3.created_at > NOW() - INTERVAL '48 hour'
        ) as has_recent_presence
      FROM devices d
      ORDER BY d.dev_eui;
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
  }

  async updateSensor(devEui: string, name: string, latitude: number | null, longitude: number | null): Promise<void> {
    await sql`
      UPDATE devices 
      SET 
        name = ${name}, 
        latitude = ${latitude}, 
        longitude = ${longitude}
      WHERE dev_eui = ${devEui.toUpperCase()}
    `;
  }

  async deleteSensorMeasurements(devEui: string): Promise<void> {
    await sql`DELETE FROM measurements WHERE dev_eui = ${devEui.toUpperCase()}`;
  }

  async deleteSensor(devEui: string, includeHistory: boolean): Promise<void> {
    const devEuiStr = devEui.toUpperCase();
    if (includeHistory) {
      await sql`DELETE FROM measurements WHERE dev_eui = ${devEuiStr}`;
    }
    await sql`DELETE FROM devices WHERE dev_eui = ${devEuiStr}`;
  }
}
