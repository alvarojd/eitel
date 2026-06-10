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

export interface ThresholdSettings {
  TEMP_CRITICAL_LOW?: number;
  TEMP_CRITICAL_HIGH?: number;
  TEMP_WARNING_LOW?: number;
  CO2_CRITICAL?: number;
  CO2_WARNING?: number;
  HUM_WARNING_HIGH?: number;
  HUM_WARNING_LOW?: number;
}

export function determineStatus(readings: SensorReadings, thresholds?: ThresholdSettings): SensorStatus {
  const { temperature, humidity, co2 } = readings;

  const tCritLow = thresholds?.TEMP_CRITICAL_LOW ?? TEMP_CRITICAL_LOW;
  const tCritHigh = thresholds?.TEMP_CRITICAL_HIGH ?? TEMP_CRITICAL_HIGH;
  const tWarnLow = thresholds?.TEMP_WARNING_LOW ?? TEMP_WARNING_LOW;
  const co2Crit = thresholds?.CO2_CRITICAL ?? CO2_CRITICAL;
  const co2Warn = thresholds?.CO2_WARNING ?? CO2_WARNING;
  const humWarnHigh = thresholds?.HUM_WARNING_HIGH ?? HUM_WARNING_HIGH;
  const humWarnLow = thresholds?.HUM_WARNING_LOW ?? HUM_WARNING_LOW;

  if (temperature < tCritLow) return SensorStatus.CRITICAL_COLD;
  if (temperature > tCritHigh) return SensorStatus.CRITICAL_HEAT;
  if (co2 > co2Crit) return SensorStatus.CRITICAL_GAS;

  if (temperature < tWarnLow) return SensorStatus.WARNING_COLD;
  if (co2 >= co2Warn) return SensorStatus.WARNING_STALE_AIR;
  if (humidity > humWarnHigh) return SensorStatus.WARNING_MOLD;
  if (humidity < humWarnLow) return SensorStatus.WARNING_DRY;

  return SensorStatus.IDEAL;
}
