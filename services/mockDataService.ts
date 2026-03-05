import { SensorData, Stats } from '../types';

// Helper to generate a hex map shape similar to the image
export const generateSensors = (): SensorData[] => {
  const sensors: SensorData[] = [];
  const mapRadius = 8;

  for (let q = -mapRadius; q <= mapRadius; q++) {
    const r1 = Math.max(-mapRadius, -q - mapRadius);
    const r2 = Math.min(mapRadius, -q + mapRadius);
    for (let r = r1; r <= r2; r++) {

      // Carve out shapes
      if (Math.abs(q) + Math.abs(r) > 12) continue;
      if (q > 3 && r < -3) continue;
      if (q < -4 && r > 2) continue;
      if (q === 0 && r === 0) continue;

      // Determine Status Logic based on probabilities (Environmental)
      const rand = Math.random();
      let estado_id: number;

      // 5% Disconnected
      if (rand > 0.95) estado_id = 1;
      // 5% Critical Cold
      else if (rand > 0.90) estado_id = 2; // FRIO_SEVERO
      // 5% Critical Heat
      else if (rand > 0.85) estado_id = 3; // CALOR_EXTREMO
      // 10% Mold Risk
      else if (rand > 0.75) estado_id = 5; // RIESGO_MOHO
      // 10% Bad Air
      else if (rand > 0.65) estado_id = 6; // AIRE_VICIADO
      // 65% Ideal
      else estado_id = 9; // IDEAL


      // Generate Metrics consistent with Status
      let temperature = 22;
      let humidity = 45;
      let co2 = 450;
      let lastSeen = 'Ahora mismo';

      switch (estado_id) {
        case 2: // FRIO_SEVERO T < 16
          temperature = parseFloat((10 + Math.random() * 5).toFixed(1)); // 10-15
          break;
        case 3: // CALOR_EXTREMO T > 30
          temperature = parseFloat((31 + Math.random() * 5).toFixed(1)); // 31-36
          break;
        case 5: // RIESGO_MOHO: T < 18 + Hum > 80
          temperature = parseFloat((12 + Math.random() * 5).toFixed(1)); // 12-17
          humidity = Math.floor(81 + Math.random() * 19); // 81-100
          break;
        case 6: // AIRE_VICIADO: CO2 > 1000
          co2 = Math.floor(1001 + Math.random() * 1000); // 1001-2000
          break;
        case 1: // DESCONECTADO
          lastSeen = `${Math.floor(2 + Math.random() * 10)} horas`;
          break;
        case 9: // IDEAL
        default:
          temperature = parseFloat((19 + Math.random() * 9).toFixed(1)); // 19-28
          humidity = Math.floor(30 + Math.random() * 40); // 30-70
          co2 = Math.floor(400 + Math.random() * 400); // 400-800
          break;
      }

      // Independent Battery Logic
      // 15% chance of low battery if connected
      let battery = Math.floor(20 + Math.random() * 80); // Default healthy
      if (estado_id !== 1 && Math.random() > 0.85) {
        battery = Math.floor(Math.random() * 19); // 0-19% (Low)
      } else if (estado_id === 1) {
        battery = 0;
      }

      sensors.push({
        id: `dev-eui-${q}-${r}`,
        name: `Sensor ${q}.${r}`,
        q,
        r,
        estado_id,
        battery,
        temperature,
        humidity,
        co2,
        rssi: estado_id === 1 ? 0 : -Math.floor(50 + Math.random() * 70),
        lastSeen,
        location: `Zona Q${q}R${r}`,
        latitude: parseFloat((40.4168 + (Math.random() * 0.1 - 0.05)).toFixed(6)), // Madrid center aprox
        longitude: parseFloat((-3.7038 + (Math.random() * 0.1 - 0.05)).toFixed(6)),
        gatewayId: `gtw-${['madrid', 'barcelona', 'valencia'][Math.floor(Math.random() * 3)]}-0${Math.floor(Math.random() * 9) + 1}`,
        indicators: {
          lowBattery: battery < 20,
          longTermNoOccupancy: Math.random() > 0.90 // 10% chance
        }
      });
    }
  }
  return sensors;
};

export const getStats = (sensors: SensorData[]): Stats => {
  const isRed = (s: SensorData) => [2, 3, 4].includes(s.estado_id);
  const isOrange = (s: SensorData) => [5, 6, 7, 8].includes(s.estado_id);
  const isGreen = (s: SensorData) => s.estado_id === 9;
  const isOffline = (s: SensorData) => s.estado_id === 1;

  return {
    total: sensors.length,
    critical: sensors.filter(isRed).length,
    warning: sensors.filter(isOrange).length,
    ideal: sensors.filter(isGreen).length,
    offline: sensors.filter(isOffline).length,
    lowBattery: sensors.filter(s => s.indicators?.lowBattery || (s.estado_id !== 1 && s.battery < 20)).length
  };
};