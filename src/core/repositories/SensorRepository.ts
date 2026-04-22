import { SensorState } from '../entities/Sensor';

export interface SensorRepository {
  getSensors(): Promise<SensorState[]>;
  updateSensor(devEui: string, name: string, latitude: number | null, longitude: number | null): Promise<void>;
  deleteSensorMeasurements(devEui: string): Promise<void>;
  deleteSensor(devEui: string, includeHistory: boolean): Promise<void>;
}
