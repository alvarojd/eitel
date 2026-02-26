import { sql } from '@vercel/postgres';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. Get current status and historical flags
    // We use subqueries to check for presence in specific windows and continuous humidity
    const { rows } = await sql`
      WITH latest_measurements AS (
        SELECT DISTINCT ON (COALESCE(dev_eui, device_id)) 
          device_id, dev_eui, name, temperature, humidity, co2, battery, rssi, presence, latitude, longitude, gateway_id, created_at
        FROM measurements
        ORDER BY COALESCE(dev_eui, device_id), created_at DESC
      ),
      first_seen AS (
        SELECT COALESCE(dev_eui, device_id) as identifier, MIN(created_at) as first_seen
        FROM measurements
        GROUP BY identifier
      ),
      presence_info AS (
        SELECT 
          COALESCE(dev_eui, device_id) as identifier,
          BOOL_OR(presence) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as presence_1h,
          BOOL_OR(presence) FILTER (WHERE created_at > NOW() - INTERVAL '2 hour') as presence_2h,
          BOOL_OR(presence) FILTER (WHERE created_at > NOW() - INTERVAL '48 hour') as presence_48h
        FROM measurements
        GROUP BY identifier
      ),
      humidity_info AS (
        SELECT 
          COALESCE(dev_eui, device_id) as identifier,
          NOT EXISTS (
            SELECT 1 FROM measurements m2 
            WHERE COALESCE(m2.dev_eui, m2.device_id) = COALESCE(m.dev_eui, m.device_id)
            AND m2.created_at > NOW() - INTERVAL '24 hours'
            AND m2.humidity <= 70
          ) as hum_high_24h_cont
        FROM measurements m
        GROUP BY identifier
      )
      SELECT 
        l.*,
        f.first_seen,
        p.presence_1h,
        p.presence_2h,
        p.presence_48h,
        h.hum_high_24h_cont
      FROM latest_measurements l
      JOIN first_seen f ON COALESCE(l.dev_eui, l.device_id) = f.identifier
      LEFT JOIN presence_info p ON COALESCE(l.dev_eui, l.device_id) = p.identifier
      LEFT JOIN humidity_info h ON COALESCE(l.dev_eui, l.device_id) = h.identifier;
    `;

    const now = new Date();
    const formattedData = rows.map(row => {
      // ... (existing date diff logic remains same)
      const diffMs = now.getTime() - new Date(row.created_at).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      let lastSeen = 'Hace un momento';

      if (diffMins > 60) {
        lastSeen = `Hace ${Math.floor(diffMins / 60)}h`;
      } else if (diffMins > 0) {
        lastSeen = `Hace ${diffMins}m`;
      }

      const temp = parseFloat(row.temperature);
      const hum = parseFloat(row.humidity);
      const co2 = row.co2 || 0;
      const pres1h = row.presence_1h || false;
      const pres2h = row.presence_2h || false;
      const pres48h = row.presence_48h || false;
      const humCont24h = row.hum_high_24h_cont || false;

      // Determine Status based on logic
      let status = 'IDEAL';

      // Red Priority
      if (temp < 16 && pres1h) {
        status = 'FRIO_SEVERO';
      } else if (temp > 27 && pres1h) {
        status = 'CALOR_EXTREMO';
      } else if (co2 > 1500 && pres2h) {
        status = 'ATMOSFERA_NOCIVA';
      }
      // Orange Priority
      else if (humCont24h) {
        status = 'RIESGO_MOHO';
      } else if (co2 > 1000 && temp < 18 && pres2h) {
        status = 'AIRE_VICIADO';
      } else if (temp < 18) {
        status = 'FRIO_MODERADO';
      } else if (hum < 30 && pres1h) {
        status = 'AIRE_SECO';
      }

      // Offline check (standard)
      if (diffMins > 120) { // 2 hours without data
        status = 'DESCONECTADO';
      }

      return {
        id: row.dev_eui || row.device_id,
        name: row.name || row.device_id,
        battery: row.battery,
        temperature: temp,
        humidity: hum,
        co2: co2,
        rssi: row.rssi,
        lastSeen: lastSeen,
        timestamp: row.created_at,
        registeredAt: row.first_seen,
        presence: row.presence,
        status: status,
        latitude: row.latitude ? parseFloat(row.latitude) : undefined,
        longitude: row.longitude ? parseFloat(row.longitude) : undefined,
        gatewayId: row.gateway_id,
        devEui: row.dev_eui,
        indicators: {
          lowBattery: row.battery < 20,
          longTermNoOccupancy: !pres48h
        }
      };
    });

    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');
    return res.status(200).json(formattedData);

  } catch (error: any) {
    if (error.code === '42P01') {
      return res.status(200).json([]);
    }
    console.error('Database Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}