import { SensorRepository } from '../../../core/repositories/SensorRepository';
import { SensorState, SensorStatus } from '../../../core/entities/Sensor';
import { db } from '../db';
import { devices, measurements } from '../schema';
import { eq, asc, sql } from 'drizzle-orm';
import { OFFLINE_MINUTES, BATTERY_LOW_PERCENT, RECENT_PRESENCE_HOURS } from '../../../core/constants';

export class PgSensorRepository implements SensorRepository {
  
  async getSensors(): Promise<SensorState[]> {
    const rows: Array<{
      dev_eui: string | null;
      device_id: string;
      name: string | null;
      battery: number | null;
      rssi: number | null;
      snr: number | null;
      latitude: number | null;
      longitude: number | null;
      gateway_id: string | null;
      registered_at: Date | null;
      temperature: number | null;
      humidity: number | null;
      co2: number | null;
      presence: boolean | null;
      estado_id: number | null;
      measured_at: Date | null;
      has_recent_presence: boolean;
    }> = await db.select({
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
        AND m3.created_at > NOW() - make_interval(hours => ${RECENT_PRESENCE_HOURS})
      )`.as('has_recent_presence'),
    })
    .from(devices)
    .orderBy(asc(devices.devEui));

    const now = Date.now();
    
    return rows.map((row): SensorState => {
      const measuredTime = row.measured_at?.getTime() ?? 0;
      const diffMs = measuredTime ? now - measuredTime : Infinity;
      const diffMins = measuredTime ? Math.floor(diffMs / 60000) : Infinity;

      const estadoId = (row.estado_id !== null && diffMins <= OFFLINE_MINUTES)
        ? row.estado_id as SensorStatus
        : SensorStatus.OFFLINE;

      return {
        id: row.dev_eui || row.device_id,
        devEui: row.dev_eui ?? undefined,
        name: row.name ?? row.device_id,
        latitude: row.latitude ?? undefined,
        longitude: row.longitude ?? undefined,
        gatewayId: row.gateway_id ?? undefined,
        registeredAt: row.registered_at ?? undefined,
        lastSeen: row.measured_at ?? undefined,
        estadoId,
        latestMeasurement: row.measured_at ? {
           sensorId: row.dev_eui || row.device_id,
           timestamp: row.measured_at,
           temperature: row.temperature ?? 0,
           humidity: row.humidity ?? 0,
           co2: row.co2 ? Number(row.co2) : undefined,
           battery: row.battery ?? 0,
           presence: row.presence ?? false,
           rssi: row.rssi ?? 0,
           snr: row.snr ?? 0,
        } : undefined,
        indicators: {
          lowBattery: (row.battery ?? 0) < BATTERY_LOW_PERCENT,
          longTermNoOccupancy: !row.has_recent_presence,
        },
      };
    });
  }

  async updateSensor(devEui: string, name: string, latitude: number | null, longitude: number | null): Promise<void> {
    await db.update(devices)
      .set({ name, latitude, longitude })
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
