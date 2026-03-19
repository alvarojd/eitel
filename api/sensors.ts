import { sql } from './db.js';
import { VercelRequest, VercelResponse } from '../src/types.js';
import { authorize } from '../src/utils/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      // Main Query: Join devices and their latest measurement
      const { rows } = await sql`
        WITH latest_recs AS (
          SELECT DISTINCT ON (d.dev_eui) 
            d.dev_eui, d.device_id, d.name, d.battery, d.rssi, d.snr, d.latitude, d.longitude, d.gateway_id, d.created_at as registered_at,
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
          snr: row.snr ? parseFloat(row.snr) : 0,
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
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // --- Protected Routes (ADMIN only) ---
  const user = authorize(req, ['ADMIN']);
  if (!user) {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
  }

  if (req.method === 'PATCH') {
    const { devEui, name, latitude, longitude } = req.body || {};
    if (!devEui) return res.status(400).json({ error: 'devEui es obligatorio' });

    try {
      await sql`
        UPDATE devices 
        SET 
          name = COALESCE(${name}, name),
          latitude = COALESCE(${latitude}, latitude),
          longitude = COALESCE(${longitude}, longitude)
        WHERE dev_eui = ${devEui.toUpperCase()}
      `;
      return res.status(200).json({ success: true, message: 'Dispositivo actualizado' });
    } catch (error) {
      console.error('Update Error:', error);
      return res.status(500).json({ error: 'Error al actualizar dispositivo' });
    }
  }

  if (req.method === 'DELETE') {
    // Try to parse body if it is a string (Vercel sometimes passes it directly as a string instead of JSON object)
    let bodyData = req.body;
    if (typeof req.body === 'string') {
      try {
        bodyData = JSON.parse(req.body);
      } catch (e) {
        bodyData = {};
      }
    }

    // Fallback to query arguments for safety
    const devEui = bodyData?.devEui || req.query?.devEui;
    const deleteHistoryOnly = bodyData?.deleteHistoryOnly !== undefined
      ? bodyData.deleteHistoryOnly
      : (req.query?.deleteHistoryOnly === 'true');

    if (!devEui) return res.status(400).json({ error: 'devEui es obligatorio' });

    try {
      const devEuiStr = String(devEui).toUpperCase();
      if (deleteHistoryOnly) {
        // Just clear history
        await sql`DELETE FROM measurements WHERE dev_eui = ${devEuiStr}`;
        return res.status(200).json({ success: true, message: 'Historial borrado' });
      } else {
        // Complete deletion (cascading if enforced, but let's be explicit)
        await sql`DELETE FROM measurements WHERE dev_eui = ${devEuiStr}`;
        await sql`DELETE FROM devices WHERE dev_eui = ${devEuiStr}`;
        return res.status(200).json({ success: true, message: 'Dispositivo y datos eliminados' });
      }
    } catch (error) {
      console.error('Delete Error:', error);
      return res.status(500).json({ error: 'Error al eliminar' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}