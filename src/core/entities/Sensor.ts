// src/core/entities/Sensor.ts

export enum SensorStatus {
  OFFLINE = 1,
  CRITICAL_ALARM = 2,
  GAS_LEAK = 3,
  SYSTEM_FAILURE = 4,
  WARNING_LOW = 5,
  WARNING_MED = 6,
  WARNING_HIGH = 7,
  MAINTENANCE = 8,
  IDEAL = 9
}

export const CRITICAL_STATUS_IDS = [
  SensorStatus.CRITICAL_ALARM,
  SensorStatus.GAS_LEAK,
  SensorStatus.SYSTEM_FAILURE
];

export const WARNING_STATUS_IDS = [
  SensorStatus.WARNING_LOW,
  SensorStatus.WARNING_MED,
  SensorStatus.WARNING_HIGH,
  SensorStatus.MAINTENANCE
];

export interface Sensor {
  id: string;
  name: string;
  devEui?: string;
  gatewayId?: string;
  latitude?: number;
  longitude?: number;
  registeredAt?: Date;
  lastSeen?: Date;
}

export interface Measurement {
  sensorId: string;
  timestamp: Date;
  temperature: number;
  humidity: number;
  co2?: number;
  battery: number;
  presence?: boolean;
  rssi: number;
  snr?: number;
}

// Este es el objeto compuesto que la UI suele necesitar
export interface SensorState extends Sensor {
  latestMeasurement?: Measurement;
  estadoId: number;
  indicators?: {
    lowBattery: boolean;
    longTermNoOccupancy: boolean;
  };
}
