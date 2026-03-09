// utils/statusEngine.ts — ÚNICA FUENTE DE VERDAD para el cálculo de estado del sensor

export enum EstadoId {
  DESCONOCIDO      = 0, // Default cuando no encaja en otro estado
  DESCONECTADO     = 1,
  FRIO_SEVERO      = 2, // T < 16°C
  CALOR_EXTREMO    = 3, // T > 27°C
  ATMOSFERA_NOCIVA = 4, // CO2 > 1500 ppm
  RIESGO_MOHO      = 5, // Hum > 70%
  AIRE_VICIADO     = 6, // CO2 >= 1000 ppm
  FRIO_MODERADO    = 7, // T < 18°C
  AIRE_SECO        = 8, // Hum < 30%
  IDEAL            = 9, // 18 <= T <= 27 && 30 <= Hum <= 70 && CO2 < 1000
}

export interface SensorReadings {
  temperature: number;
  humidity: number;
  co2: number;
}

/**
 * Determina el estado_id de un sensor basado en sus lecturas ambientales.
 *
 * Orden de prioridad: Críticos primero (2-4), después Avisos (5-8),
 * luego Ideal (9) si cumple TODAS las condiciones óptimas,
 * y finalmente Desconocido (0) como fallback.
 */
export function determineStatus(readings: SensorReadings): EstadoId {
  const { temperature, humidity, co2 } = readings;

  // --- Críticos (Rojo) ---
  if (temperature < 16)  return EstadoId.FRIO_SEVERO;
  if (temperature > 27)  return EstadoId.CALOR_EXTREMO;
  if (co2 > 1500)        return EstadoId.ATMOSFERA_NOCIVA;

  // --- Riesgo / Aviso (Naranja) ---
  if (humidity > 70)     return EstadoId.RIESGO_MOHO;
  if (co2 >= 1000)       return EstadoId.AIRE_VICIADO;
  if (temperature < 18)  return EstadoId.FRIO_MODERADO;
  if (humidity < 30)     return EstadoId.AIRE_SECO;

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
