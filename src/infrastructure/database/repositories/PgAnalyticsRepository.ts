import { AnalyticsRepository } from '../../../core/repositories/AnalyticsRepository';
import { AnalyticsDataPoint } from '../../actions/analyticsActions';
import { sql } from '../db';

export class PgAnalyticsRepository implements AnalyticsRepository {
  async getAnalyticsData(devEui: string, startDate: string, endDate: string, variable: string): Promise<AnalyticsDataPoint[]> {
    const query = `
      SELECT 
        created_at as timestamp,
        ${variable} as value
      FROM measurements
      WHERE dev_eui = $1
      AND created_at >= ($2 || ' 00:00:00 Europe/Madrid')::timestamptz
      AND created_at < ($3 || ' 00:00:00 Europe/Madrid')::timestamptz + interval '1 day'
      ORDER BY created_at ASC;
    `;

    const { rows } = await sql.query(query, [devEui, startDate, endDate]);

    return rows.map(r => ({
      timestamp: r.timestamp,
      value: parseFloat(r.value) || 0
    }));
  }
}
