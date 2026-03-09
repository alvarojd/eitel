import { sql } from '@vercel/postgres';
import { VercelRequest, VercelResponse } from '../src/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Main Query: Join devices and their latest measurement
    const { rows } = await sql`
      WITH latest_recs AS (
        SELECT DISTINCT ON (d.dev_eui) 
          d.dev_eui, d.device_id, d.name, d.battery, d.rssi, d.latitude, d.longitude, d.gateway_id, d.created_at as registered_at,
          m.temperature, m.humidity, m.co2, m.presence, m.estado_id, m.created_at as measured_at
        FROM devices d
        LEFT JOIN measurements m ON d.dev_eui = m.dev_eui
        ORDER BY d.dev_eui, m.created_at DESC
      )
      SELECT 
        l.*,
        EXISTS(
          SELECT 1 FROM measurements m3 
          WHERE m3.dev_eui = l.dev_eui 
          AND m3.presence = true 
          AND m3.created_at > NOW() - INTERVAL '48 hour'
        ) as has_recent_presence
      FROM latest_recs l;
    `;

    const now = new Date();
    const formattedData = rows.map(row => {
      // Handle cases where a device is registered but has no measurements yet
      const measuredTime = row.measured_at ? new Date(row.measured_at).getTime() : 0;
      const diffMs = measuredTime ? now.getTime() - measuredTime : Infinity;
      const diffMins = measuredTime ? Math.floor(diffMs / 60000) : Infinity;

      let lastSeen = 'Hace un momento';
      if (diffMins === Infinity) {
        lastSeen = 'Nunca';
      } else if (diffMins > 60) {
        lastSeen = `Hace ${Math.floor(diffMins / 60)}h`;
      } else if (diffMins > 0) {
        lastSeen = `Hace ${diffMins}m`;
      }

      // Dynamic calculation for Disconnected State (If no data in 2 hours)
      let final_estado_id = row.estado_id !== null ? row.estado_id : 1;
      if (diffMins > 120) {
        final_estado_id = 1;
      }

      return {
        id: row.dev_eui || row.device_id,
        name: row.name || row.device_id,
        battery: row.battery || 0,
        temperature: row.temperature ? parseFloat(row.temperature) : 0,
        humidity: row.humidity ? parseFloat(row.humidity) : 0,
        co2: row.co2 || 0,
        rssi: row.rssi || 0,
        lastSeen,
        timestamp: row.measured_at,
        registeredAt: row.registered_at,
        presence: row.presence || false,
        estado_id: final_estado_id,
        latitude: row.latitude ? parseFloat(row.latitude) : undefined,
        longitude: row.longitude ? parseFloat(row.longitude) : undefined,
        gatewayId: row.gateway_id,
        devEui: row.dev_eui,
        indicators: {
          lowBattery: (row.battery || 0) < 20,
          longTermNoOccupancy: !row.has_recent_presence
        }
      };
    });

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(200).json(formattedData);

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('CRITICAL Database Error:', err);

    const isDev = process.env.NODE_ENV === 'development';
    return res.status(500).json({
      error: 'Internal Server Error',
      ...(isDev && { message: err.message, stack: err.stack }),
    });
  }
}