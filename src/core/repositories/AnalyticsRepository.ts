import { AnalyticsDataPoint } from '../../infrastructure/actions/analyticsActions';

export interface AnalyticsRepository {
  getAnalyticsData(devEui: string, startDate: string, endDate: string, variable: string): Promise<AnalyticsDataPoint[]>;
}
