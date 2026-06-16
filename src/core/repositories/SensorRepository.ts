import { SensorState } from '../entities/Sensor';

export interface SensorRepository {
  getSensors(): Promise<SensorState[]>;
  updateSensor(devEui: string, data: { name: string, latitude: number | null, longitude: number | null, notificationEmail?: string | null, notificationsEnabled?: boolean, monthlyReportConfiguredAt?: Date | null }): Promise<void>;
  deleteSensorMeasurements(devEui: string): Promise<void>;
  deleteSensor(devEui: string, includeHistory: boolean): Promise<void>;
}
