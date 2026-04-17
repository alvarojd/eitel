import { SensorState, SensorStatus, CRITICAL_STATUS_IDS, WARNING_STATUS_IDS } from '../entities/Sensor';

export type StatusType = 'critico' | 'riesgo' | 'ideal' | 'desconectado' | 'bateria_baja' | 'ausencia' | 'all';

export function getStatusType(estadoId: number): StatusType {
  if (CRITICAL_STATUS_IDS.includes(estadoId)) return 'critico';
  if (WARNING_STATUS_IDS.includes(estadoId)) return 'riesgo';
  if (estadoId === SensorStatus.IDEAL) return 'ideal';
  if (estadoId === SensorStatus.OFFLINE) return 'desconectado';
  return 'all';
}

export function filterSensors(sensors: SensorState[], filter: string, searchTerm: string = ''): SensorState[] {
  let filtered = sensors;

  // 1. Filtrado por estado o indicador
  if (filter !== 'all') {
    if (filter === 'bateria_baja') {
      filtered = filtered.filter(s => s.indicators?.lowBattery);
    } else if (filter === 'ausencia') {
      filtered = filtered.filter(s => s.indicators?.longTermNoOccupancy);
    } else {
      filtered = filtered.filter(s => getStatusType(s.estadoId) === filter);
    }
  }

  // 2. Filtrado por término de búsqueda (Nombre o DevEUI)
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase().trim();
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(term) || 
      (s.devEui && s.devEui.toLowerCase().includes(term)) ||
      (s.id && s.id.toLowerCase().includes(term))
    );
  }

  return filtered;
}
