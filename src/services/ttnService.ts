import { SensorData, HeatmapDeviceRow } from '../types';
import { determineStatus } from '../utils/statusEngine';
import { isLocalEnvironment } from '../utils/environment';

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



export const fetchSensorData = async (): Promise<SensorData[]> => {
  try {
    // Fetch from our own Vercel Serverless Function
    const response = await fetch('/api/sensors');

    // Force real data in production: do NOT fall back to mock data
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error [${response.status}]: ${errorText}`);
      try {
        const errJson = JSON.parse(errorText);
        console.error("API Error details:", errJson);
      } catch (e) {
        // Not JSON, already logged as text
      }
      return [];
    }

    const rawData = await response.json();
    console.log(`Successfully fetched ${rawData.length} sensors from API.`);

    if (rawData.length === 0) return [];

    // Assign Hex Coordinates dynamically to the list of devices
    const coords = getHexPositions(rawData.length);

    // Map DB Data to SensorData for UI
    return rawData.map((device: any, index: number) => {
      const q = coords[index]?.q || 0;
      const r = coords[index]?.r || 0;

      // Use the status provided by the backend if available, otherwise calculate locally (fallback)
      const estado_id = device.estado_id !== undefined ? device.estado_id : determineStatus({ temperature: device.temperature, humidity: device.humidity, co2: device.co2 });

      return {
        id: device.id,
        name: device.name || device.id,
        q,
        r,
        estado_id: estado_id,
        battery: device.battery,
        temperature: device.temperature,
        humidity: device.humidity,
        co2: device.co2,
        rssi: device.rssi,
        lastSeen: device.lastSeen,
        location: device.location || `Hex ${q},${r}`,
        registeredAt: device.registeredAt,
        presence: device.presence,
        latitude: device.latitude,
        longitude: device.longitude,
        gatewayId: device.gatewayId,
        devEui: device.devEui,
        indicators: device.indicators
      };
    });

  } catch (error) {
    console.error("Failed to fetch sensors:", error);
    return [];
  }
};

export const fetchSensorHistory = async (deviceId: string): Promise<any[]> => {
  try {
    const response = await fetch(`/api/history?deviceId=${deviceId}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch sensor history:", error);
    return [];
  }
};

export const fetchHeatmapData = async (): Promise<HeatmapDeviceRow[]> => {
  try {
    const response = await fetch('/api/heatmap');
    if (!response.ok) {
       console.error(`Heatmap API Error [${response.status}]`);
       return [];
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch heatmap data:", error);
    return [];
  }
};

export const fetchReportData = async (days: number, devEui?: string): Promise<any[]> => {
  try {
    const url = devEui 
      ? `/api/reports?days=${days}&devEui=${devEui}` 
      : `/api/reports?days=${days}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.map((d: any) => ({
      ...d,
      time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: d.temperature // for charts compatibility
    }));
  } catch (error) {
    console.error("Failed to fetch report data:", error);
    return [];
  }
};