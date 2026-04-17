// src/core/use-cases/statusEngine.ts

export enum EstadoId {
  DESCONOCIDO = 0,
  DESCONECTADO = 1,
  FRIO_SEVERO = 2,
  CALOR_EXTREMO = 3,
  ATMOSFERA_NOCIVA = 4,
  RIESGO_MOHO = 5,
  AIRE_VICIADO = 6,
  FRIO_MODERADO = 7,
  AIRE_SECO = 8,
  IDEAL = 9,
}

export interface SensorReadings {
  temperature: number;
  humidity: number;
  co2: number;
}

export function determineStatus(readings: SensorReadings): EstadoId {
  const { temperature, humidity, co2 } = readings;

  // --- Críticos (Rojo) ---
  if (temperature < 16) return EstadoId.FRIO_SEVERO;
  if (temperature > 27) return EstadoId.CALOR_EXTREMO;
  if (co2 > 1500) return EstadoId.ATMOSFERA_NOCIVA;

  // --- Riesgo / Aviso (Naranja) ---
  if (temperature < 18) return EstadoId.FRIO_MODERADO;
  if (co2 >= 1000) return EstadoId.AIRE_VICIADO;
  if (humidity > 70) return EstadoId.RIESGO_MOHO;
  if (humidity < 30) return EstadoId.AIRE_SECO;

  // --- Ideal (Verde) — requiere TODAS las condiciones óptimas ---
  if (
    temperature >= 18 && temperature <= 27 &&
    humidity >= 30 && humidity <= 70 &&
    co2 < 1000
  ) {
    return EstadoId.IDEAL;
  }

  // --- Fallback ---
  return EstadoId.DESCONOCIDO;
}
