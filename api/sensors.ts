import { sql } from '@vercel/postgres';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. Separate Migration to avoid blocking
    try {
      await sql`ALTER TABLE measurements ADD COLUMN IF NOT EXISTS name VARCHAR(255);`;
    } catch (e) {
      console.warn("Migration warning (non-fatal):", e);
    }

    // 2. Main Query: Simplified to ensure data is returned
    const { rows } = await sql`
      WITH latest_recs AS (
        SELECT DISTINCT ON (UPPER(COALESCE(dev_eui, device_id))) 
          *
        FROM measurements
        ORDER BY UPPER(COALESCE(dev_eui, device_id)), created_at DESC
      )
      SELECT 
        l.*,
        (SELECT MIN(created_at) FROM measurements m2 WHERE UPPER(COALESCE(m2.dev_eui, m2.device_id)) = UPPER(COALESCE(l.dev_eui, l.device_id))) as first_seen,
        -- Simple Presence check
        EXISTS(SELECT 1 FROM measurements m3 WHERE UPPER(COALESCE(m3.dev_eui, m3.device_id)) = UPPER(COALESCE(l.dev_eui, l.device_id)) AND m3.presence = true AND m3.created_at > NOW() - INTERVAL '48 hour') as has_recent_presence
      FROM latest_recs l;
    `;

    const now = new Date();
    const formattedData = rows.map(row => {
      const diffMs = now.getTime() - new Date(row.created_at).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      let lastSeen = 'Hace un momento';

      if (diffMins > 60) {
        lastSeen = `Hace ${Math.floor(diffMins / 60)}h`;
      } else if (diffMins > 0) {
        lastSeen = `Hace ${diffMins}m`;
      }

      const temp = parseFloat(row.temperature) || 0;
      const hum = parseFloat(row.humidity) || 0;
      const co2 = row.co2 || 0;

      // Status logic (simplified for reliability)
      let status = 'IDEAL';
      if (diffMins > 120) {
        status = 'DESCONECTADO';
      } else if (temp < 16) {
        status = 'FRIO_SEVERO';
      } else if (temp > 27) {
        status = 'CALOR_EXTREMO';
      } else if (co2 > 1000) {
        status = 'AIRE_VICIADO';
      } else if (hum > 70) {
        status = 'RIESGO_MOHO';
      }

      return {
        id: (row.dev_eui || row.device_id).toUpperCase(),
        name: row.name || row.device_id,
        battery: row.battery || 0,
        temperature: temp,
        humidity: hum,
        co2: co2,
        rssi: row.rssi || 0,
        lastSeen,
        timestamp: row.created_at,
        registeredAt: row.first_seen,
        presence: row.presence,
        status,
        latitude: row.latitude ? parseFloat(row.latitude) : undefined,
        longitude: row.longitude ? parseFloat(row.longitude) : undefined,
        gatewayId: row.gateway_id,
        devEui: row.dev_eui ? row.dev_eui.toUpperCase() : undefined,
        indicators: {
          lowBattery: (row.battery || 0) < 20,
          longTermNoOccupancy: !row.has_recent_presence
        }
      };
    });

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(200).json(formattedData);

  } catch (error: any) {
    console.error('CRITICAL Database Error:', error);
    // Return empty list instead of 500 to keep UI "alive"
    return res.status(500).json({
      error: 'Data source error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}