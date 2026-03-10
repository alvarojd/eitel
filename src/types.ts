export enum Tab {
  RESUMEN = 'resumen',
  MAPA = 'mapa',
  DISPOSITIVOS = 'dispositivos',
  ALERTAS = 'alertas',
  CONFIGURACION = 'configuracion',
  CRONO = 'crono'
}

export interface SensorData {
  id: string;
  name: string;
  q: number; // Axial coordinate q
  r: number; // Axial coordinate r
  estado_id: number;
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
    longTermNoOccupancy: boolean;
  };
  latitude?: number;
  longitude?: number;
  gatewayId?: string;
  devEui?: string;
}

export interface Stats {
  total: number;
  critical: number; // Rojo (2, 3, 4)
  warning: number;  // Naranja (5, 6, 7, 8)
  ideal: number;    // Verde (9)
  offline: number;  // Gris (1)
  lowBattery: number; // Conteo independiente
  absenceCount: number; // Ausencia prolongada
  avgTemp?: number;
  uptime?: number;
}

export interface TTNConfig {
  appId: string;
  apiKey: string;
  region: string;
  useSimulatedData?: boolean;
}

export interface HistoryDataPoint {
  time: string;
  value: number;
  humidity: number;
  co2: number;
  timestamp: string;
}

export interface HeatmapDataPoint {
  timestamp: string;
  estado_id: number;
  hasData: boolean;
  presence: boolean;
}

export interface HeatmapDeviceRow {
  deviceId: string;
  name: string;
  data: HeatmapDataPoint[]; // Should contain 24 entries ideally
}

// Minimal types for Vercel Serverless Functions to avoid 'any'
export interface VercelRequest {
  method?: string;
  body?: any;
  query: { [key: string]: string | string[] };
  headers: { [key: string]: string | string[] | undefined };
}

export interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => VercelResponse;
  setHeader: (name: string, value: string | number | readonly string[]) => VercelResponse;
}