// src/core/use-cases/statusEngine.ts
import { SensorStatus } from '../entities/Sensor';

export interface SensorReadings {
  temperature: number;
  humidity: number;
  co2: number;
}

export function determineStatus(readings: SensorReadings): SensorStatus {
  const { temperature, humidity, co2 } = readings;

  // Critical (Red) - Highest priority
  if (temperature < 16) return SensorStatus.CRITICAL_COLD;
  if (temperature > 27) return SensorStatus.CRITICAL_HEAT;
  if (co2 > 1500) return SensorStatus.CRITICAL_GAS;

  // Warnings (Orange)
  if (temperature < 18) return SensorStatus.WARNING_COLD;
  if (co2 >= 1000) return SensorStatus.WARNING_STALE_AIR;
  if (humidity > 70) return SensorStatus.WARNING_MOLD;
  if (humidity < 30) return SensorStatus.WARNING_DRY;

  // If we reach here, all conditions for IDEAL are met by elimination
  return SensorStatus.IDEAL;
}
