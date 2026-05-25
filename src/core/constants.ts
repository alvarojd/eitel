// Hexagon Layout Configuration
export const HEX_SIZE = 22;
export const HEX_GAP = 2;

// Sensor Thresholds
export const TEMP_CRITICAL_LOW = 16;
export const TEMP_WARNING_LOW = 18;
export const TEMP_CRITICAL_HIGH = 27;
export const CO2_CRITICAL = 1500;
export const CO2_WARNING = 1000;
export const HUM_WARNING_HIGH = 70;
export const HUM_WARNING_LOW = 30;

// Battery Thresholds (Saft LS14500 calibration)
export const BATTERY_FULL_VOLTAGE = 3.65;
export const BATTERY_PLATEAU_END = 3.15;
export const BATTERY_DROP_START = 2.80;
export const BATTERY_EMPTY_VOLTAGE = 2.00;
export const BATTERY_LOW_PERCENT = 20;

// Time Thresholds
export const OFFLINE_MINUTES = 120;
export const RECENT_PRESENCE_HOURS = 48;
export const SENSOR_POLL_INTERVAL_MS = 30000;
export const CRON_REMINDER_DAYS = 7;
export const OFFLINE_ALERT_HOURS = 24;

// Analytics Limits
export const MAX_EXPORT_ROWS = 10000;
export const MAX_ANALYTICS_ROWS = 5000;

// Colores basados en el mapa de estados numéricos
// 0: Negro (Otro estado)
// 1: Gris (Desconectado)
// 2-4: Rojo (Critical)
// 5-8: Naranja (Warning)
// 9: Verde (Ideal)

export const STATUS_COLORS: Record<number, string> = {
  0: '#000000', // Negro
  1: '#64748b', // Slate-500 (Gris)
  2: '#ef4444', // Red-500
  3: '#ef4444', // Red-500
  4: '#ef4444', // Red-500
  5: '#f97316', // Orange-500
  6: '#f97316', // Orange-500
  7: '#f97316', // Orange-500
  8: '#f97316', // Orange-500
  9: '#22c55e', // Green-500
};

export const STATUS_BG_COLORS: Record<number, string> = {
  0: 'bg-black',
  1: 'bg-slate-500',
  2: 'bg-red-500',
  3: 'bg-red-500',
  4: 'bg-red-500',
  5: 'bg-orange-500',
  6: 'bg-orange-500',
  7: 'bg-orange-500',
  8: 'bg-orange-500',
  9: 'bg-green-500',
};

export const STATUS_TEXT_COLORS: Record<number, string> = {
  0: 'text-slate-300',
  1: 'text-slate-400',
  2: 'text-red-500',
  3: 'text-red-500',
  4: 'text-red-500',
  5: 'text-orange-500',
  6: 'text-orange-500',
  7: 'text-orange-500',
  8: 'text-orange-500',
  9: 'text-green-500',
};

export const STATUS_LABELS: Record<number, string> = {
  0: 'Otro Estado / Desconocido',
  1: 'Desconectado',
  2: 'Frío Severo (Pobreza Energética)',
  3: 'Calor Extremo',
  4: 'Atmósfera Nociva',
  5: 'Riesgo Biológico (Moho)',
  6: 'Aire Viciado (Confinamiento)',
  7: 'Frío Moderado (Pobreza Leve)',
  8: 'Aire Seco (Irritación)',
  9: 'Situación Ideal',
};
