import { HeatmapRepository, HeatmapDataPoint } from '../../../core/repositories/HeatmapRepository';
import { sql } from '../db';

export class PgHeatmapRepository implements HeatmapRepository {
  async getHeatmapData(): Promise<HeatmapDataPoint[]> {
    const { rows } = await sql`
        WITH date_series AS (
            SELECT generate_series(
                date_trunc('hour', NOW() - INTERVAL '23 hours'),
                date_trunc('hour', NOW()),
                '1 hour'
            ) AS hour
        ),
        device_hours AS (
            SELECT d.device_id, d.dev_eui, d.name, ds.hour
            FROM devices d
            CROSS JOIN date_series ds
        ),
        aggregated_measurements AS (
            SELECT 
                d.dev_eui,
                date_trunc('hour', m.created_at) AS hour,
                AVG(m.temperature) AS avg_temp,
                AVG(m.humidity) AS avg_hum,
                AVG(m.co2) AS avg_co2,
                BOOL_OR(m.presence) AS any_presence,
                COUNT(m.id) as read_count
            FROM devices d
            LEFT JOIN measurements m ON d.dev_eui = m.dev_eui
            WHERE m.created_at >= date_trunc('hour', NOW() - INTERVAL '23 hours')
            GROUP BY d.dev_eui, date_trunc('hour', m.created_at)
        )
        SELECT 
            dh.device_id,
            dh.dev_eui,
            dh.name,
            dh.hour as timestamp,
            am.avg_temp as temperature,
            am.avg_hum as humidity,
            am.avg_co2 as co2,
            am.any_presence as presence,
            am.read_count
        FROM device_hours dh
        LEFT JOIN aggregated_measurements am 
            ON dh.dev_eui = am.dev_eui AND dh.hour = am.hour
        ORDER BY dh.name ASC, dh.hour ASC;
    `;
    return rows as HeatmapDataPoint[];
  }
}
