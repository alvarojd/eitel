import { sql } from './_db.js';
import { determineStatus } from '../src/utils/statusEngine.js';
import { VercelRequest, VercelResponse } from '../src/types.js';

// --- Sanitization Helpers ---
function parseNumeric(value: unknown, fallback: number): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function sanitizeString(value: unknown, maxLength: number = 255): string {
  return String(value ?? '').slice(0, maxLength);
}

const WEBHOOK_SECRET = process.env.TTN_WEBHOOK_SECRET;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Log incoming request for debugging (sensitive info should be masked in production)
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'];
  console.log(`Webhook received from IP: ${ip}`);

  try {
    // 1. Authentication (Shared Secret with TTN)
    const authHeader = req.headers['x-downlink-apikey'] || req.headers.authorization;
    if (WEBHOOK_SECRET && authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      console.warn('Unauthorized webhook attempt: Secret mismatch or missing.');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 2. Parse TTN Payload
    const { end_device_ids, uplink_message } = req.body || {};
    const payload = uplink_message?.decoded_payload;
    const rx_metadata = uplink_message?.rx_metadata;
    const received_at = uplink_message?.received_at || new Date().toISOString();

    if (!payload) {
      console.warn('Webhook received without decoded_payload. Check TTN Formatter.', {
        has_body: !!req.body,
        has_uplink: !!uplink_message,
        device_ids: end_device_ids
      });
      return res.status(400).json({ error: 'Invalid payload: missing decoded_payload' });
    }

    const dev_eui = sanitizeString(end_device_ids?.dev_eui || payload?.dev_eui).toUpperCase();
    const device_id = sanitizeString(end_device_ids?.device_id || payload?.device_id || dev_eui).toLowerCase();
    const name = sanitizeString(end_device_ids?.device_id || device_id);

    if (!dev_eui || dev_eui === 'UNDEFINED') {
      console.error('CRITICAL: Missing dev_eui in TTN payload.', req.body);
      return res.status(400).json({ error: 'Invalid payload: missing dev_eui' });
    }

    // Sanitized & clamped to sensor-realistic ranges
    const temperature = clamp(parseNumeric(payload.temperature, 0), -40, 80);
    const humidity    = clamp(parseNumeric(payload.humidity, 0), 0, 100);
    const co2         = clamp(Math.round(parseNumeric(payload.CO2, 0)), 0, 10000);
    const presence = payload.presence === true;

    // Handle Coordinates and Gateway ID
    let latitude = payload.latitude || payload.lat || payload.gps_lat;
    let longitude = payload.longitude || payload.lon || payload.lng || payload.gps_lng;

    const locations = uplink_message?.locations;
    if (!latitude && locations) {
      const locSource = locations.user || locations['frm-payload'] || Object.values(locations)[0];
      if (locSource) {
        latitude = (locSource as any).latitude;
        longitude = (locSource as any).longitude;
      }
    }

    let gateway_id = null;
    let rssi = -100;
    let snr = 0;
    if (rx_metadata && rx_metadata.length > 0) {
      const bestGw = rx_metadata.reduce((prev: any, curr: any) =>
        ((prev.rssi || -200) > (curr.rssi || -200)) ? prev : curr
      );
      gateway_id = bestGw.gateway_ids?.gateway_id || bestGw.packet_id;
      rssi = bestGw.rssi || -100;
      snr = bestGw.snr || 0;

      if (!latitude && bestGw.location) {
        latitude = bestGw.location.latitude;
        longitude = bestGw.location.longitude;
      }
    }

    // Handle Battery Voltage
    let battery = 100;
    if (typeof payload.battery_voltage === 'number') {
      const minV = 3.0;
      const maxV = 3.6;
      const voltage = payload.battery_voltage;
      const pct = ((voltage - minV) / (maxV - minV)) * 100;
      battery = Math.min(100, Math.max(0, Math.round(pct)));
    } else if (typeof payload.battery === 'number') {
      battery = Math.min(100, Math.max(0, Math.round(payload.battery)));
    }

    // 2. Calculate estado_id using centralized status engine
    const estado_id = determineStatus({ temperature, humidity, co2 });

    // 3. Database Updates
    // A. UPSERT context into `devices` table
    await sql`
      INSERT INTO devices (dev_eui, device_id, name, battery, rssi, snr, latitude, longitude, gateway_id, created_at)
      VALUES (${dev_eui}, ${device_id}, ${name}, ${battery}, ${rssi}, ${snr}, ${latitude || null}, ${longitude || null}, ${gateway_id}, ${received_at})
      ON CONFLICT (dev_eui) DO UPDATE 
      SET 
        name = COALESCE(devices.name, EXCLUDED.name),
        battery = EXCLUDED.battery,
        rssi = EXCLUDED.rssi,
        snr = EXCLUDED.snr,
        latitude = COALESCE(devices.latitude, EXCLUDED.latitude),
        longitude = COALESCE(devices.longitude, EXCLUDED.longitude),
        gateway_id = EXCLUDED.gateway_id;
    `;

    // B. INSERT new read into `measurements` table
    await sql`
      INSERT INTO measurements (dev_eui, temperature, humidity, co2, presence, estado_id, created_at)
      VALUES (${dev_eui}, ${temperature}, ${humidity}, ${co2}, ${presence}, ${estado_id}, ${received_at});
    `;

    return res.status(200).json({ success: true });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Database Error:', err);

    const isDev = process.env.NODE_ENV === 'development';
    return res.status(500).json({
      error: 'Internal Server Error',
      ...(isDev && { message: err.message, stack: err.stack }),
    });
  }
} // NOTE: End of webhook handler