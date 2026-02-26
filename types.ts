export enum SensorStatus {
  FRIO_SEVERO = 'FRIO_SEVERO',           // Rojo: T < 16 + presencia 1h
  CALOR_EXTREMO = 'CALOR_EXTREMO',       // Rojo: T > 27 + presencia 1h
  ATMOSFERA_NOCIVA = 'ATMOSFERA_NOCIVA', // Rojo: CO2 > 1500 + presencia 2h
  RIESGO_MOHO = 'RIESGO_MOHO',           // Naranja: Hum > 70% por 24h
  AIRE_VICIADO = 'AIRE_VICIADO',         // Naranja: CO2 > 1000 + T < 18 + presencia 2h
  FRIO_MODERADO = 'FRIO_MODERADO',       // Naranja: T < 18
  AIRE_SECO = 'AIRE_SECO',               // Naranja: Hum < 30% + presencia 1h
  IDEAL = 'IDEAL',                       // Verde
  DESCONECTADO = 'DESCONECTADO',         // Gris
  AZUL = 'AZUL',                         // Azul: Otros
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
  indicators?: {
    lowBattery: boolean;
    longTermNoOccupancy: boolean; // 48h sin presencia
  };
  latitude?: number;
  longitude?: number;
  gatewayId?: string;
  devEui?: string;
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
  useSimulatedData?: boolean;
}