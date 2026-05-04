// src/core/entities/Sensor.ts

export enum SensorStatus {
  UNKNOWN = 0,
  OFFLINE = 1,
  CRITICAL_COLD = 2,
  CRITICAL_HEAT = 3,
  CRITICAL_GAS = 4,
  WARNING_MOLD = 5,
  WARNING_STALE_AIR = 6,
  WARNING_COLD = 7,
  WARNING_DRY = 8,
  IDEAL = 9
}

export const CRITICAL_STATUS_IDS = [
  SensorStatus.CRITICAL_COLD,
  SensorStatus.CRITICAL_HEAT,
  SensorStatus.CRITICAL_GAS
];

export const WARNING_STATUS_IDS = [
  SensorStatus.WARNING_MOLD,
  SensorStatus.WARNING_STALE_AIR,
  SensorStatus.WARNING_COLD,
  SensorStatus.WARNING_DRY
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
  estadoId: SensorStatus;
  indicators?: {
    lowBattery: boolean;
    longTermNoOccupancy: boolean;
  };
}
