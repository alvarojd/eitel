export interface HistoryDataPoint {
  temperature: string;
  humidity: string;
  co2: string;
  created_at: Date;
}

export interface ReportDataPoint {
  dev_eui: string;
  timestamp: Date;
  temperature: string;
  humidity: string;
  co2: string;
  presence: boolean;
}

export interface ExportDataPoint {
  created_at: Date;
  dev_eui: string;
  device_name: string;
  temperature: number;
  humidity: number;
  co2: number;
  presence: boolean;
}

export interface HistoryRepository {
  getSensorHistory(deviceId: string): Promise<HistoryDataPoint[]>;
  getReports(days: number, devEui?: string): Promise<ReportDataPoint[]>;
  getExportData(deviceIds: string[], startDate?: string, endDate?: string, allData?: boolean): Promise<ExportDataPoint[]>;
}
