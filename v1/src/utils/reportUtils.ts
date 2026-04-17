import { EstadoId, determineStatus } from './statusEngine';

export interface HistoryDataPoint {
  timestamp: string; // ISO date string
  temperature: number;
  humidity: number;
  co2: number;
  presence: boolean;
  deviceId: string;
}

export interface ReportPercentages {
  [EstadoId.FRIO_SEVERO]: number;
  [EstadoId.CALOR_EXTREMO]: number;
  [EstadoId.ATMOSFERA_NOCIVA]: number;
  [EstadoId.RIESGO_MOHO]: number;
  [EstadoId.AIRE_VICIADO]: number;
  [EstadoId.FRIO_MODERADO]: number;
  [EstadoId.AIRE_SECO]: number;
  [EstadoId.IDEAL]: number;
  [EstadoId.DESCONECTADO]: number;
  [EstadoId.DESCONOCIDO]: number;
}

export type PresenceFilterType = 'all' | 'with-presence' | 'without-presence';

// Creates a zero-filled percentage object
export const createEmptyPercentages = (): ReportPercentages => ({
  [EstadoId.FRIO_SEVERO]: 0,
  [EstadoId.CALOR_EXTREMO]: 0,
  [EstadoId.ATMOSFERA_NOCIVA]: 0,
  [EstadoId.RIESGO_MOHO]: 0,
  [EstadoId.AIRE_VICIADO]: 0,
  [EstadoId.FRIO_MODERADO]: 0,
  [EstadoId.AIRE_SECO]: 0,
  [EstadoId.IDEAL]: 0,
  [EstadoId.DESCONECTADO]: 0,
  [EstadoId.DESCONOCIDO]: 0,
});

/**
 * Aggregates raw history data into hourly blocks and calculates the
 * average of the readings, finally determining the EstadoId for that hour.
 * Also applies the presence filter.
 */
export const calculateStatePercentages = (
  data: HistoryDataPoint[],
  presenceFilter: PresenceFilterType
): { percentages: ReportPercentages; totalHours: number } => {
  const filteredData = data.filter((d) => {
    if (presenceFilter === 'with-presence') return d.presence === true;
    if (presenceFilter === 'without-presence') return d.presence === false;
    return true; // 'all'
  });

  if (filteredData.length === 0) {
    return { percentages: createEmptyPercentages(), totalHours: 0 };
  }

  // Step 1: Group by deviceId AND hour
  // Format hash key: `deviceId_YYYY-MM-DDTHH`
  const groupedByHour: Record<string, HistoryDataPoint[]> = {};
  
  filteredData.forEach(d => {
    const date = new Date(d.timestamp);
    const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}`;
    const key = `${d.deviceId}_${hourKey}`;
    
    if (!groupedByHour[key]) {
      groupedByHour[key] = [];
    }
    groupedByHour[key].push(d);
  });

  // Step 2: Calculate average for each group and determine status
  const hourlyStatuses: EstadoId[] = [];
  
  Object.values(groupedByHour).forEach((hourReadings) => {
    // If we want to simulate disconnected, maybe we check if readings are empty? Usually groupedByHour implies we have readings.
    let avgTemp = 0;
    let avgHum = 0;
    let avgCo2 = 0;
    
    hourReadings.forEach(r => {
      avgTemp += r.temperature;
      avgHum += r.humidity;
      avgCo2 += r.co2;
    });
    
    const count = hourReadings.length;
    avgTemp /= count;
    avgHum /= count;
    avgCo2 /= count;
    
    const status = determineStatus({ temperature: avgTemp, humidity: avgHum, co2: avgCo2 });
    hourlyStatuses.push(status);
  });

  // Step 3: Count statuses
  const counts = createEmptyPercentages();
  const totalHours = hourlyStatuses.length;

  hourlyStatuses.forEach(status => {
    if (counts[status as keyof typeof counts] !== undefined) {
      counts[status as keyof typeof counts]++;
    } else {
      counts[EstadoId.DESCONOCIDO]++;
    }
  });

  // Step 4: Convert to percentages
  const percentages = createEmptyPercentages();
  if (totalHours > 0) {
    (Object.keys(counts) as unknown as EstadoId[]).forEach((key) => {
       percentages[key as keyof ReportPercentages] = (counts[key as keyof ReportPercentages] / totalHours) * 100;
    });
  }

  return { percentages, totalHours };
};
