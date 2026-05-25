// src/core/use-cases/statusEngine.ts
import { SensorStatus } from '../entities/Sensor';
import {
  TEMP_CRITICAL_LOW,
  TEMP_CRITICAL_HIGH,
  TEMP_WARNING_LOW,
  CO2_CRITICAL,
  CO2_WARNING,
  HUM_WARNING_HIGH,
  HUM_WARNING_LOW,
} from '../constants';

export interface SensorReadings {
  temperature: number;
  humidity: number;
  co2: number;
}

export function determineStatus(readings: SensorReadings): SensorStatus {
  const { temperature, humidity, co2 } = readings;

  if (temperature < TEMP_CRITICAL_LOW) return SensorStatus.CRITICAL_COLD;
  if (temperature > TEMP_CRITICAL_HIGH) return SensorStatus.CRITICAL_HEAT;
  if (co2 > CO2_CRITICAL) return SensorStatus.CRITICAL_GAS;

  if (temperature < TEMP_WARNING_LOW) return SensorStatus.WARNING_COLD;
  if (co2 >= CO2_WARNING) return SensorStatus.WARNING_STALE_AIR;
  if (humidity > HUM_WARNING_HIGH) return SensorStatus.WARNING_MOLD;
  if (humidity < HUM_WARNING_LOW) return SensorStatus.WARNING_DRY;

  return SensorStatus.IDEAL;
}
