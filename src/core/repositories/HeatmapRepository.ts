export interface HeatmapDataPoint {
  device_id: string;
  dev_eui: string;
  name: string;
  timestamp: Date;
  temperature: string;
  humidity: string;
  co2: string;
  presence: boolean;
  read_count: number;
}

export interface HeatmapRepository {
  getHeatmapData(): Promise<HeatmapDataPoint[]>;
}
