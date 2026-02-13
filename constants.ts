import { SensorStatus } from './types';

// Hexagon Layout Configuration
export const HEX_SIZE = 14;
export const HEX_GAP = 2;

// Colores basados en la imagen proporcionada
// Rojo (Critical): Frío Severo, Calor Extremo
// Naranja (Warning): Riesgo Moho, Aire Viciado
// Verde (Ideal): Situación Ideal
// Gris: Desconectado

export const STATUS_COLORS = {
  [SensorStatus.FRIO_SEVERO]: '#ef4444',   // Red-500
  [SensorStatus.CALOR_EXTREMO]: '#ef4444', // Red-500
  [SensorStatus.RIESGO_MOHO]: '#f97316',   // Orange-500
  [SensorStatus.AIRE_VICIADO]: '#f97316',  // Orange-500
  [SensorStatus.IDEAL]: '#22c55e',         // Green-500
  [SensorStatus.DESCONECTADO]: '#64748b',  // Slate-500 (Gray)
};

export const STATUS_BG_COLORS = {
  [SensorStatus.FRIO_SEVERO]: 'bg-red-500',
  [SensorStatus.CALOR_EXTREMO]: 'bg-red-500',
  [SensorStatus.RIESGO_MOHO]: 'bg-orange-500',
  [SensorStatus.AIRE_VICIADO]: 'bg-orange-500',
  [SensorStatus.IDEAL]: 'bg-green-500',
  [SensorStatus.DESCONECTADO]: 'bg-slate-500',
};

export const STATUS_TEXT_COLORS = {
  [SensorStatus.FRIO_SEVERO]: 'text-red-500',
  [SensorStatus.CALOR_EXTREMO]: 'text-red-500',
  [SensorStatus.RIESGO_MOHO]: 'text-orange-500',
  [SensorStatus.AIRE_VICIADO]: 'text-orange-500',
  [SensorStatus.IDEAL]: 'text-green-500',
  [SensorStatus.DESCONECTADO]: 'text-slate-400',
};

export const STATUS_LABELS = {
  [SensorStatus.FRIO_SEVERO]: 'Frío Severo',
  [SensorStatus.CALOR_EXTREMO]: 'Calor Extremo',
  [SensorStatus.RIESGO_MOHO]: 'Riesgo Biológico (Moho)',
  [SensorStatus.AIRE_VICIADO]: 'Aire Viciado',
  [SensorStatus.IDEAL]: 'Situación Ideal',
  [SensorStatus.DESCONECTADO]: 'Desconectado',
};