// Hexagon Layout Configuration
export const HEX_SIZE = 22;
export const HEX_GAP = 2;

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
