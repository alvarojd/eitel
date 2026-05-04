import { SensorRepository } from '../../../core/repositories/SensorRepository';
import { SensorState, SensorStatus } from '../../../core/entities/Sensor';
import { db } from '../db';
import { devices, measurements } from '../schema';
import { eq, asc, sql } from 'drizzle-orm';

export class PgSensorRepository implements SensorRepository {
  
  async getSensors(): Promise<SensorState[]> {
    const rows = await db.select({
      dev_eui: devices.devEui,
      device_id: devices.deviceId,
      name: devices.name,
      battery: devices.battery,
      rssi: devices.rssi,
      snr: devices.snr,
      latitude: devices.latitude,
      longitude: devices.longitude,
      gateway_id: devices.gatewayId,
      registered_at: devices.createdAt,
      temperature: devices.temperature,
      humidity: devices.humidity,
      co2: devices.co2,
      presence: devices.presence,
      estado_id: devices.estadoId,
      measured_at: devices.lastMeasuredAt,
      has_recent_presence: sql<boolean>`EXISTS(
        SELECT 1 FROM measurements m3 
        WHERE m3.dev_eui = ${devices.devEui} 
        AND m3.presence = true 
        AND m3.created_at > NOW() - INTERVAL '48 hour'
      )`.as('has_recent_presence'),
    })
    .from(devices)
    .orderBy(asc(devices.devEui));

    const now = new Date();
    
    return rows.map(row => {
      const measuredTime = row.measured_at ? new Date(row.measured_at).getTime() : 0;
      const diffMs = measuredTime ? now.getTime() - measuredTime : Infinity;
      const diffMins = measuredTime ? Math.floor(diffMs / 60000) : Infinity;

      let final_estado_id = row.estado_id !== null ? row.estado_id : SensorStatus.OFFLINE;
      if (diffMins > 120) {
        final_estado_id = SensorStatus.OFFLINE; // Offline / Inactive
      }

      return {
        id: row.dev_eui || row.device_id,
        devEui: row.dev_eui,
        name: row.name || row.device_id,
        latitude: row.latitude ? parseFloat(row.latitude) : undefined,
        longitude: row.longitude ? parseFloat(row.longitude) : undefined,
        gatewayId: row.gateway_id,
        registeredAt: row.registered_at ? new Date(row.registered_at).toISOString() : undefined,
        lastSeen: row.measured_at ? new Date(row.measured_at).toISOString() : undefined,
        estadoId: final_estado_id,
        latestMeasurement: row.measured_at ? {
           sensorId: row.dev_eui || row.device_id,
           timestamp: new Date(row.measured_at).toISOString(),
           temperature: row.temperature ? parseFloat(row.temperature) : 0,
           humidity: row.humidity ? parseFloat(row.humidity) : 0,
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
      } as any;
    });
  }

  async updateSensor(devEui: string, name: string, latitude: number | null, longitude: number | null): Promise<void> {
    await db.update(devices)
      .set({ name, latitude: latitude ? String(latitude) : null, longitude: longitude ? String(longitude) : null })
      .where(eq(devices.devEui, devEui.toUpperCase()));
  }

  async deleteSensorMeasurements(devEui: string): Promise<void> {
    await db.delete(measurements).where(eq(measurements.devEui, devEui.toUpperCase()));
  }

  async deleteSensor(devEui: string, includeHistory: boolean): Promise<void> {
    const devEuiStr = devEui.toUpperCase();
    if (includeHistory) {
      await db.delete(measurements).where(eq(measurements.devEui, devEuiStr));
    }
    await db.delete(devices).where(eq(devices.devEui, devEuiStr));
  }
}
