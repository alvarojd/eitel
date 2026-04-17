import { SensorData } from '../types';

// Shared status type classification used by DeviceList and GeoMap filters
export type StatusType = 'critico' | 'riesgo' | 'ideal' | 'desconectado' | 'bateria_baja' | 'ausencia' | 'all';

export function getStatusType(estado_id: number): StatusType {
  if ([2, 3, 4].includes(estado_id)) return 'critico';
  if ([5, 6, 7, 8].includes(estado_id)) return 'riesgo';
  if (estado_id === 9) return 'ideal';
  if (estado_id === 1) return 'desconectado';
  return 'all';
}

export function filterSensors(sensors: SensorData[], filter: string): SensorData[] {
  if (filter === 'all') return sensors;
  if (filter === 'bateria_baja') return sensors.filter(s => s.indicators?.lowBattery);
  if (filter === 'ausencia') return sensors.filter(s => s.indicators?.longTermNoOccupancy);
  return sensors.filter(s => getStatusType(s.estado_id) === filter);
}
