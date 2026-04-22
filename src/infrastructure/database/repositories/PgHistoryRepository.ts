import { HistoryRepository, HistoryDataPoint, ReportDataPoint, ExportDataPoint } from '../../../core/repositories/HistoryRepository';
import { sql } from '../db';

export class PgHistoryRepository implements HistoryRepository {
  async getSensorHistory(deviceId: string): Promise<HistoryDataPoint[]> {
    const { rows } = await sql`
      SELECT m.temperature, m.humidity, m.co2, m.created_at
      FROM measurements m
      JOIN devices d ON m.dev_eui = d.dev_eui
      WHERE (UPPER(d.device_id) = UPPER(${deviceId}) OR UPPER(d.dev_eui) = UPPER(${deviceId}))
      AND m.created_at > NOW() - INTERVAL '24 hours'
      ORDER BY m.created_at ASC;
    `;
    return rows as HistoryDataPoint[];
  }

  async getReports(days: number, devEui?: string): Promise<ReportDataPoint[]> {
    let rows;
    if (devEui) {
      ({ rows } = await sql`
        SELECT 
          m.dev_eui,
          date_trunc('hour', m.created_at) AS timestamp,
          AVG(m.temperature) AS temperature,
          AVG(m.humidity) AS humidity,
          AVG(m.co2) AS co2,
          BOOL_OR(m.presence) AS presence
        FROM measurements m
        WHERE m.dev_eui = ${String(devEui).toUpperCase()}
        AND m.created_at >= NOW() - (${days} || ' days')::interval
        GROUP BY m.dev_eui, date_trunc('hour', m.created_at)
        ORDER BY timestamp ASC;
      `);
    } else {
      ({ rows } = await sql`
        SELECT 
          m.dev_eui,
          date_trunc('hour', m.created_at) AS timestamp,
          AVG(m.temperature) AS temperature,
          AVG(m.humidity) AS humidity,
          AVG(m.co2) AS co2,
          BOOL_OR(m.presence) AS presence
        FROM measurements m
        WHERE m.created_at >= NOW() - (${days} || ' days')::interval
        GROUP BY m.dev_eui, date_trunc('hour', m.created_at)
        ORDER BY timestamp ASC;
      `);
    }
    return rows as ReportDataPoint[];
  }

  async getExportData(deviceIds: string[], startDate?: string, endDate?: string, allData: boolean = false): Promise<ExportDataPoint[]> {
    let values: any[] = [deviceIds];
    
    let baseQuery = `
      SELECT 
        m.created_at, 
        m.dev_eui, 
        d.name as device_name,
        m.temperature, 
        m.humidity, 
        m.co2, 
        m.presence
      FROM measurements m
      JOIN devices d ON m.dev_eui = d.dev_eui
      WHERE m.dev_eui = ANY($1)
    `;

    if (!allData) {
      if (startDate && endDate) {
        baseQuery += ` AND m.created_at >= ($2 || ' 00:00:00 Europe/Madrid')::timestamptz 
                       AND m.created_at < ($3 || ' 00:00:00 Europe/Madrid')::timestamptz + interval '1 day'`;
        values.push(startDate, endDate);
      } else {
        baseQuery += ` AND m.created_at > NOW() - INTERVAL '24 hours'`;
      }
    }

    baseQuery += ` ORDER BY m.created_at DESC`;

    const { rows } = await sql.query(baseQuery, values);
    return rows as ExportDataPoint[];
  }
}
