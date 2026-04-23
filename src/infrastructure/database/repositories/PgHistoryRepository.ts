import { HistoryRepository, HistoryDataPoint, ReportDataPoint, ExportDataPoint } from '../../../core/repositories/HistoryRepository';
import { db } from '../db';
import { measurements, devices } from '../schema';
import { eq, or, and, asc, desc, sql, inArray, gte, lt } from 'drizzle-orm';

export class PgHistoryRepository implements HistoryRepository {
  async getSensorHistory(deviceId: string): Promise<HistoryDataPoint[]> {
    const rows = await db.select({
      temperature: measurements.temperature,
      humidity: measurements.humidity,
      co2: measurements.co2,
      created_at: measurements.createdAt,
    })
    .from(measurements)
    .innerJoin(devices, eq(measurements.devEui, devices.devEui))
    .where(and(
      or(
        eq(sql`UPPER(${devices.deviceId})`, deviceId.toUpperCase()),
        eq(sql`UPPER(${devices.devEui})`, deviceId.toUpperCase())
      ),
      sql`${measurements.createdAt} > NOW() - INTERVAL '24 hours'`
    ))
    .orderBy(asc(measurements.createdAt));

    return rows.map(r => ({
      ...r,
      co2: String(r.co2),
      created_at: r.created_at as Date,
    })) as unknown as HistoryDataPoint[];
  }

  async getReports(days: number, devEui?: string): Promise<ReportDataPoint[]> {
    const timestampCol = sql`date_trunc('hour', ${measurements.createdAt})`.as('timestamp');
    
    let baseQuery = db.select({
      dev_eui: measurements.devEui,
      timestamp: timestampCol,
      temperature: sql<number>`AVG(${measurements.temperature})`,
      humidity: sql<number>`AVG(${measurements.humidity})`,
      co2: sql<number>`AVG(${measurements.co2})`,
      presence: sql<boolean>`BOOL_OR(${measurements.presence})`,
    })
    .from(measurements)
    .$dynamic();

    if (devEui) {
      baseQuery = baseQuery.where(and(
        eq(measurements.devEui, String(devEui).toUpperCase()),
        gte(measurements.createdAt, sql`NOW() - (${days} || ' days')::interval`)
      ));
    } else {
      baseQuery = baseQuery.where(
        gte(measurements.createdAt, sql`NOW() - (${days} || ' days')::interval`)
      );
    }

    const rows = await baseQuery
      .groupBy(measurements.devEui, sql`date_trunc('hour', ${measurements.createdAt})`)
      .orderBy(asc(timestampCol));

    return rows as any as ReportDataPoint[];
  }

  async getExportData(deviceIds: string[], startDate?: string, endDate?: string, allData: boolean = false): Promise<ExportDataPoint[]> {
    let baseQuery = db.select({
      created_at: measurements.createdAt,
      dev_eui: measurements.devEui,
      device_name: devices.name,
      temperature: measurements.temperature,
      humidity: measurements.humidity,
      co2: measurements.co2,
      presence: measurements.presence,
    })
    .from(measurements)
    .innerJoin(devices, eq(measurements.devEui, devices.devEui))
    .where(inArray(measurements.devEui, deviceIds))
    .$dynamic();

    if (!allData) {
      if (startDate && endDate) {
        baseQuery = baseQuery.where(and(
          inArray(measurements.devEui, deviceIds),
          gte(measurements.createdAt, sql`(${startDate} || ' 00:00:00 Europe/Madrid')::timestamptz`),
          lt(measurements.createdAt, sql`(${endDate} || ' 00:00:00 Europe/Madrid')::timestamptz + interval '1 day'`)
        ));
      } else {
        baseQuery = baseQuery.where(and(
          inArray(measurements.devEui, deviceIds),
          sql`${measurements.createdAt} > NOW() - INTERVAL '24 hours'`
        ));
      }
    }

    const rows = await baseQuery.orderBy(desc(measurements.createdAt));
    return rows.map(r => ({
      ...r,
      temperature: Number(r.temperature),
      humidity: Number(r.humidity),
      co2: Number(r.co2),
      created_at: r.created_at as Date,
      dev_eui: r.dev_eui as string,
      device_name: r.device_name as string,
      presence: r.presence as boolean,
    })) as ExportDataPoint[];
  }
}

