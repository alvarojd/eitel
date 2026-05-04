import { NextRequest, NextResponse } from 'next/server';
import { sql } from '../../../infrastructure/database/db';
import { determineStatus } from '../../../core/use-cases/statusEngine';

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

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.TTN_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    console.error('FATAL: TTN_WEBHOOK_SECRET environment variable is required for webhook security');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');

  try {
    // 1. Authentication
    const authHeader = req.headers.get('x-downlink-apikey') || req.headers.get('authorization');
    if (authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      console.warn(`Unauthorized webhook attempt from IP: ${ip}`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse TTN Payload
    const bodyText = await req.text();
    let bodyData: any = {};
    try {
      bodyData = JSON.parse(bodyText);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { end_device_ids, uplink_message } = bodyData;
    const payload = uplink_message?.decoded_payload;
    const rx_metadata = uplink_message?.rx_metadata;
    const received_at = uplink_message?.received_at || new Date().toISOString();

    if (!payload) {
      console.warn('Webhook received without decoded_payload. Check TTN Formatter.');
      return NextResponse.json({ error: 'Invalid payload: missing decoded_payload' }, { status: 400 });
    }

    const dev_eui = sanitizeString(end_device_ids?.dev_eui || payload?.dev_eui).toUpperCase();
    const device_id = sanitizeString(end_device_ids?.device_id || payload?.device_id || dev_eui).toLowerCase();
    const name = sanitizeString(end_device_ids?.device_id || device_id);

    if (!dev_eui || dev_eui === 'UNDEFINED') {
      return NextResponse.json({ error: 'Invalid payload: missing dev_eui' }, { status: 400 });
    }

    // Sanitized variables
    const temperature = clamp(parseNumeric(payload.temperature, 0), -40, 80);
    const humidity    = clamp(parseNumeric(payload.humidity, 0), 0, 100);
    const co2         = clamp(Math.round(parseNumeric(payload.CO2, 0)), 0, 10000);
    const presence    = payload.presence === true;

    // Handle Coordinates
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

    // Gateway and Quality
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

    // Battery calculation
    let battery = 100;
    if (typeof payload.battery_voltage === 'number') {
      const minV = 3.0, maxV = 3.6;
      const pct = ((payload.battery_voltage - minV) / (maxV - minV)) * 100;
      battery = Math.min(100, Math.max(0, Math.round(pct)));
    } else if (typeof payload.battery === 'number') {
      battery = Math.min(100, Math.max(0, Math.round(payload.battery)));
    }

    // Determine status (Domain Logic)
    const estado_id = determineStatus({ temperature, humidity, co2 });

    // Database Updates using Drizzle ORM
    await sql`
      INSERT INTO devices (
        dev_eui, device_id, name, battery, rssi, snr, latitude, longitude, gateway_id, created_at,
        temperature, humidity, co2, estado_id, presence, last_measured_at
      )
      VALUES (
        ${dev_eui}, ${device_id}, ${name}, ${battery}, ${rssi}, ${snr}, ${latitude || null}, ${longitude || null}, ${gateway_id}, ${received_at},
        ${temperature}, ${humidity}, ${co2}, ${estado_id}, ${presence}, ${received_at}
      )
      ON CONFLICT (dev_eui) DO UPDATE 
      SET 
        name = COALESCE(devices.name, EXCLUDED.name),
        battery = EXCLUDED.battery,
        rssi = EXCLUDED.rssi,
        snr = EXCLUDED.snr,
        latitude = COALESCE(devices.latitude, EXCLUDED.latitude),
        longitude = COALESCE(devices.longitude, EXCLUDED.longitude),
        gateway_id = EXCLUDED.gateway_id,
        temperature = EXCLUDED.temperature,
        humidity = EXCLUDED.humidity,
        co2 = EXCLUDED.co2,
        estado_id = EXCLUDED.estado_id,
        presence = EXCLUDED.presence,
        last_measured_at = EXCLUDED.last_measured_at;
    `;

    await sql`
      INSERT INTO measurements (dev_eui, temperature, humidity, co2, presence, estado_id, created_at)
      VALUES (${dev_eui}, ${temperature}, ${humidity}, ${co2}, ${presence}, ${estado_id}, ${received_at});
    `;

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
