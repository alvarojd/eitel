export enum SensorStatus {
  FRIO_SEVERO = 'FRIO_SEVERO',       // Rojo: T < 16
  CALOR_EXTREMO = 'CALOR_EXTREMO',   // Rojo: T > 30
  RIESGO_MOHO = 'RIESGO_MOHO',       // Naranja: T < 18 + Hum > 80%
  AIRE_VICIADO = 'AIRE_VICIADO',     // Naranja: CO2 > 1000 ppm
  IDEAL = 'IDEAL',                   // Verde: T adecuada + CO2 bajo
  DESCONECTADO = 'DESCONECTADO',     // Gris
}

export interface SensorData {
  id: string;
  name: string;
  q: number; // Axial coordinate q
  r: number; // Axial coordinate r
  status: SensorStatus;
  battery: number;
  temperature: number;
  humidity: number;
  co2?: number;
  rssi: number; // Signal strength
  lastSeen: string;
  location: string;
  registeredAt?: string;
  presence?: boolean;
}

export interface Stats {
  total: number;
  critical: number; // Rojo
  warning: number;  // Naranja
  ideal: number;    // Verde
  offline: number;  // Gris
  lowBattery: number; // Conteo independiente
}

export interface TTNConfig {
  appId: string;
  apiKey: string;
  region: string;
}