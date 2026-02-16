import { SensorData, SensorStatus } from '../types';
import { generateSensors } from './mockDataService';

// Helper to generate hex coordinates in a spiral (BFS) to fill from center
const getHexPositions = (count: number): { q: number; r: number }[] => {
  const positions: { q: number; r: number }[] = [];
  const visited = new Set<string>();
  const queue: { q: number; r: number }[] = [{ q: 0, r: 0 }];

  visited.add("0,0");

  const directions = [
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
  ];

  while (positions.length < count && queue.length > 0) {
    const current = queue.shift()!;
    positions.push(current);

    for (const dir of directions) {
      const nextQ = current.q + dir.q;
      const nextR = current.r + dir.r;
      const key = `${nextQ},${nextR}`;

      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ q: nextQ, r: nextR });
      }
    }
  }

  return positions;
};

// Determine status based on actual sensor metrics
const determineStatus = (temp: number, hum: number, co2: number, lastSeenStr: string): SensorStatus => {
  if (temp < 16) return SensorStatus.FRIO_SEVERO;
  if (temp > 30) return SensorStatus.CALOR_EXTREMO;
  if (temp < 18 && hum > 80) return SensorStatus.RIESGO_MOHO;
  if (co2 > 1000) return SensorStatus.AIRE_VICIADO;

  return SensorStatus.IDEAL;
};

export const fetchSensorData = async (): Promise<SensorData[]> => {
  try {
    // Fetch from our own Vercel Serverless Function
    const response = await fetch('/api/sensors');

    // Graceful fallback for Local Development or API Error (404/500)
    if (!response.ok) {
      console.warn(`API unavailable (${response.status}). Using mock data.`);
      return generateSensors();
    }

    const rawData = await response.json();

    if (rawData.length === 0) return [];

    // Assign Hex Coordinates dynamically to the list of devices
    const coords = getHexPositions(rawData.length);

    // Map DB Data to SensorData for UI
    return rawData.map((device: any, index: number) => {
      const q = coords[index]?.q || 0;
      const r = coords[index]?.r || 0;

      const status = determineStatus(device.temperature, device.humidity, device.co2, device.lastSeen);

      return {
        id: device.id,
        name: device.id,
        q,
        r,
        status,
        battery: device.battery,
        temperature: device.temperature,
        humidity: device.humidity,
        co2: device.co2,
        rssi: device.rssi,
        lastSeen: device.lastSeen,
        location: `Hex ${q},${r}`,
        registeredAt: device.registeredAt
      };
    });

  } catch (error) {
    console.error("Failed to fetch sensors, falling back to mock:", error);
    return generateSensors();
  }
};