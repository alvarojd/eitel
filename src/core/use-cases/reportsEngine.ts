import { determineStatus } from './statusEngine';
import { SensorStatus } from '../entities/Sensor';

export interface HistoryDataPoint {
  timestamp: Date;
  temperature: number;
  humidity: number;
  co2: number;
  presence: boolean;
  deviceId: string;
}

export type PresenceFilterType = 'all' | 'with-presence' | 'without-presence';

export interface ReportPercentages {
  [SensorStatus.CRITICAL_COLD]: number;
  [SensorStatus.CRITICAL_HEAT]: number;
  [SensorStatus.CRITICAL_GAS]: number;
  [SensorStatus.WARNING_MOLD]: number;
  [SensorStatus.WARNING_STALE_AIR]: number;
  [SensorStatus.WARNING_COLD]: number;
  [SensorStatus.WARNING_DRY]: number;
  [SensorStatus.IDEAL]: number;
  [SensorStatus.OFFLINE]: number;
  [SensorStatus.UNKNOWN]: number;
}

export const createEmptyPercentages = (): ReportPercentages => ({
  [SensorStatus.CRITICAL_COLD]: 0,
  [SensorStatus.CRITICAL_HEAT]: 0,
  [SensorStatus.CRITICAL_GAS]: 0,
  [SensorStatus.WARNING_MOLD]: 0,
  [SensorStatus.WARNING_STALE_AIR]: 0,
  [SensorStatus.WARNING_COLD]: 0,
  [SensorStatus.WARNING_DRY]: 0,
  [SensorStatus.IDEAL]: 0,
  [SensorStatus.OFFLINE]: 0,
  [SensorStatus.UNKNOWN]: 0,
});

export interface AggregatedMetrics {
  avgTemp: number; maxTemp: number; minTemp: number; stdDevTemp: number; medTemp: number;
  avgHum: number; maxHum: number; minHum: number; stdDevHum: number; medHum: number;
  avgCo2: number; maxCo2: number; minCo2: number; stdDevCo2: number; medCo2: number;
}

export const calculateReportMetrics = (
  data: HistoryDataPoint[],
  presenceFilter: PresenceFilterType
): { percentages: ReportPercentages; totalHours: number; metrics: AggregatedMetrics } => {
  const filteredData = data.filter((d) => {
    if (presenceFilter === 'with-presence') return d.presence === true;
    if (presenceFilter === 'without-presence') return d.presence === false;
    return true; // 'all'
  });

  const emptyMetrics: AggregatedMetrics = {
    avgTemp: 0, maxTemp: 0, minTemp: 0, stdDevTemp: 0, medTemp: 0,
    avgHum: 0, maxHum: 0, minHum: 0, stdDevHum: 0, medHum: 0,
    avgCo2: 0, maxCo2: 0, minCo2: 0, stdDevCo2: 0, medCo2: 0
  };

  if (filteredData.length === 0) {
    return { percentages: createEmptyPercentages(), totalHours: 0, metrics: emptyMetrics };
  }

  // Calculate percentages based on statuses provided directly or calculated
  const hourlyStatuses: SensorStatus[] = [];
  
  const temps: number[] = [];
  const hums: number[] = [];
  const co2s: number[] = [];
  
  let sumT = 0, sumH = 0, sumC = 0;
  let maxT = -999, minT = 999;
  let maxH = -999, minH = 999;
  let maxC = -999, minC = 99999;

  filteredData.forEach(d => {
    // Collect status based on means
    const status = determineStatus({ temperature: d.temperature, humidity: d.humidity, co2: d.co2 });
    hourlyStatuses.push(status);

    temps.push(d.temperature);
    hums.push(d.humidity);
    co2s.push(d.co2);

    // Sums for averages
    sumT += d.temperature;
    sumH += d.humidity;
    sumC += d.co2;
    
    // Min Maxs
    if (d.temperature > maxT) maxT = d.temperature;
    if (d.temperature < minT) minT = d.temperature;
    if (d.humidity > maxH) maxH = d.humidity;
    if (d.humidity < minH) minH = d.humidity;
    if (d.co2 > maxC) maxC = d.co2;
    if (d.co2 < minC) minC = d.co2;
  });

  const count = filteredData.length;
  const avgT = sumT / count;
  const avgH = sumH / count;
  const avgC = sumC / count;

  // Median Helper (Optimized In-Place)
  const calculateMedianInPlace = (arr: number[]) => {
    if (arr.length === 0) return 0;
    arr.sort((a, b) => a - b);
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
  };

  // Standard Deviation
  let sumSqDiffT = 0, sumSqDiffH = 0, sumSqDiffC = 0;
  filteredData.forEach(d => {
    sumSqDiffT += Math.pow(d.temperature - avgT, 2);
    sumSqDiffH += Math.pow(d.humidity - avgH, 2);
    sumSqDiffC += Math.pow(d.co2 - avgC, 2);
  });

  const metrics: AggregatedMetrics = {
    avgTemp: avgT, maxTemp: maxT, minTemp: minT, stdDevTemp: Math.sqrt(sumSqDiffT / count), medTemp: calculateMedianInPlace(temps),
    avgHum: avgH, maxHum: maxH, minHum: minH, stdDevHum: Math.sqrt(sumSqDiffH / count), medHum: calculateMedianInPlace(hums),
    avgCo2: avgC, maxCo2: maxC, minCo2: minC, stdDevCo2: Math.sqrt(sumSqDiffC / count), medCo2: calculateMedianInPlace(co2s)
  };

  // Percentages Loop
  const counts = createEmptyPercentages();
  const totalHours = hourlyStatuses.length;

  hourlyStatuses.forEach(status => {
    if (counts[status as keyof typeof counts] !== undefined) {
      counts[status as keyof typeof counts]++;
    } else {
      counts[SensorStatus.UNKNOWN]++;
    }
  });

  const percentages = createEmptyPercentages();
  if (totalHours > 0) {
    (Object.keys(counts) as unknown as SensorStatus[]).forEach((key) => {
       percentages[key as keyof ReportPercentages] = (counts[key as keyof ReportPercentages] / totalHours) * 100;
    });
  }

  return { percentages, totalHours, metrics };
};
