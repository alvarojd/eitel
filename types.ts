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
}

export interface TTNConfig {
  appId: string;
  apiKey: string;
  region: string;
  useSimulatedData?: boolean;
}