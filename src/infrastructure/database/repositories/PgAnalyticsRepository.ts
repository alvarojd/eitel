import { AnalyticsRepository } from '../../../core/repositories/AnalyticsRepository';
import { AnalyticsDataPoint } from '../../actions/analyticsActions';
import { db } from '../db';
import { measurements } from '../schema';
import { eq, and, asc, sql, gte, lt } from 'drizzle-orm';

export class PgAnalyticsRepository implements AnalyticsRepository {
  async getAnalyticsData(devEui: string, startDate: string, endDate: string, variable: string): Promise<AnalyticsDataPoint[]> {
    const valueColumn = sql`${sql.identifier(variable)}`;

    const rows = await db.select({
      timestamp: measurements.createdAt,
      value: valueColumn,
    })
    .from(measurements)
    .where(and(
      eq(measurements.devEui, devEui),
      gte(measurements.createdAt, sql`(${startDate} || ' 00:00:00 Europe/Madrid')::timestamptz`),
      lt(measurements.createdAt, sql`(${endDate} || ' 00:00:00 Europe/Madrid')::timestamptz + interval '1 day'`)
    ))
    .orderBy(asc(measurements.createdAt));

    return rows.map((r: any) => ({
      timestamp: r.timestamp,
      value: parseFloat(r.value) || 0
    }));
  }
}
