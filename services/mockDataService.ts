import { SensorData, SensorStatus, Stats } from '../types';

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
      let status: SensorStatus;

      // 5% Disconnected
      if (rand > 0.95) status = SensorStatus.DESCONECTADO;
      // 5% Critical Cold
      else if (rand > 0.90) status = SensorStatus.FRIO_SEVERO;
      // 5% Critical Heat
      else if (rand > 0.85) status = SensorStatus.CALOR_EXTREMO;
      // 10% Mold Risk
      else if (rand > 0.75) status = SensorStatus.RIESGO_MOHO;
      // 10% Bad Air
      else if (rand > 0.65) status = SensorStatus.AIRE_VICIADO;
      // 65% Ideal
      else status = SensorStatus.IDEAL;


      // Generate Metrics consistent with Status
      let temperature = 22;
      let humidity = 45;
      let co2 = 450;
      let lastSeen = 'Ahora mismo';

      switch (status) {
        case SensorStatus.FRIO_SEVERO: // T < 16
          temperature = parseFloat((10 + Math.random() * 5).toFixed(1)); // 10-15
          break;
        case SensorStatus.CALOR_EXTREMO: // T > 30
          temperature = parseFloat((31 + Math.random() * 5).toFixed(1)); // 31-36
          break;
        case SensorStatus.RIESGO_MOHO: // T < 18 + Hum > 80
          temperature = parseFloat((12 + Math.random() * 5).toFixed(1)); // 12-17
          humidity = Math.floor(81 + Math.random() * 19); // 81-100
          break;
        case SensorStatus.AIRE_VICIADO: // CO2 > 1000
          co2 = Math.floor(1001 + Math.random() * 1000); // 1001-2000
          break;
        case SensorStatus.DESCONECTADO:
          lastSeen = `${Math.floor(2 + Math.random() * 10)} horas`;
          break;
        case SensorStatus.IDEAL:
        default:
          temperature = parseFloat((19 + Math.random() * 9).toFixed(1)); // 19-28
          humidity = Math.floor(30 + Math.random() * 40); // 30-70
          co2 = Math.floor(400 + Math.random() * 400); // 400-800
          break;
      }

      // Independent Battery Logic
      // 15% chance of low battery if connected
      let battery = Math.floor(20 + Math.random() * 80); // Default healthy
      if (status !== SensorStatus.DESCONECTADO && Math.random() > 0.85) {
        battery = Math.floor(Math.random() * 19); // 0-19% (Low)
      } else if (status === SensorStatus.DESCONECTADO) {
        battery = 0;
      }

      sensors.push({
        id: `dev-eui-${q}-${r}`,
        name: `Sensor ${q}.${r}`,
        q,
        r,
        status,
        battery,
        temperature,
        humidity,
        co2,
        rssi: status === SensorStatus.DESCONECTADO ? 0 : -Math.floor(50 + Math.random() * 70),
        lastSeen,
        location: `Zona Q${q}R${r}`,
        latitude: parseFloat((40.4168 + (Math.random() * 0.1 - 0.05)).toFixed(6)), // Madrid center aprox
        longitude: parseFloat((-3.7038 + (Math.random() * 0.1 - 0.05)).toFixed(6)),
        gatewayId: `gtw-${['madrid', 'barcelona', 'valencia'][Math.floor(Math.random() * 3)]}-0${Math.floor(Math.random() * 9) + 1}`
      });
    }
  }
  return sensors;
};

export const getStats = (sensors: SensorData[]): Stats => {
  const isRed = (s: SensorData) => [SensorStatus.FRIO_SEVERO, SensorStatus.CALOR_EXTREMO, SensorStatus.ATMOSFERA_NOCIVA].includes(s.status);
  const isOrange = (s: SensorData) => [SensorStatus.RIESGO_MOHO, SensorStatus.AIRE_VICIADO, SensorStatus.FRIO_MODERADO, SensorStatus.AIRE_SECO, SensorStatus.AZUL].includes(s.status);
  const isGreen = (s: SensorData) => s.status === SensorStatus.IDEAL;
  const isOffline = (s: SensorData) => s.status === SensorStatus.DESCONECTADO;

  return {
    total: sensors.length,
    critical: sensors.filter(isRed).length,
    warning: sensors.filter(isOrange).length,
    ideal: sensors.filter(isGreen).length,
    offline: sensors.filter(isOffline).length,
    lowBattery: sensors.filter(s => s.indicators?.lowBattery || (s.status !== SensorStatus.DESCONECTADO && s.battery < 20)).length
  };
};