import { sql } from '@vercel/postgres';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. Parse TTN Payload
    const { end_device_ids, uplink_message } = req.body;
    const payload = uplink_message?.decoded_payload;
    const rx_metadata = uplink_message?.rx_metadata;
    const received_at = uplink_message?.received_at || new Date().toISOString();

    const device_id = (end_device_ids?.device_id || payload?.device_id)?.toUpperCase();
    const dev_eui = (end_device_ids?.dev_eui || '').toUpperCase();
    const name = end_device_ids?.device_id;

    if (!device_id || !payload || !dev_eui) {
      console.warn('Missing device_id, dev_eui or payload', req.body);
      return res.status(400).json({ error: 'Invalid payload: missing dev_eui or decoded_payload' });
    }

    const temperature = parseFloat(payload.temperature) || 0;
    const humidity = parseFloat(payload.humidity) || 0;
    const co2 = parseInt(payload.CO2) || 0;
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
    if (rx_metadata && rx_metadata.length > 0) {
      const bestGw = rx_metadata.reduce((prev: any, curr: any) =>
        ((prev.rssi || -200) > (curr.rssi || -200)) ? prev : curr
      );
      gateway_id = bestGw.gateway_ids?.gateway_id || bestGw.packet_id;
      rssi = bestGw.rssi || -100;

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

    // 2. Calculate estado_id based on user requirements (ignoring 1 - Offline)
    let estado_id = 0; // Default: Otro estado

    if (temperature < 16) {
      estado_id = 2; // Frio Severo
    } else if (temperature > 27) {
      estado_id = 3; // Calor Extremo
    } else if (co2 > 1500) {
      estado_id = 4; // Atmosfera Nociva
    } else if (humidity > 70) {
      estado_id = 5; // Riesgo Biologico
    } else if (co2 >= 1000) {
      estado_id = 6; // Aire Viciado (Confinamiento)
    } else if (temperature < 18) {
      estado_id = 7; // Frio Moderado
    } else if (humidity < 30) {
      estado_id = 8; // Aire Seco
    } else if (temperature >= 18 && temperature <= 27 && humidity >= 30 && humidity <= 70 && co2 < 1000) {
      estado_id = 9; // Situacion ideal (verificando CO2 < 1000 en lugar de > 1000)
    }

    // 3. Database Updates
    // A. UPSERT context into `devices` table
    await sql`
      INSERT INTO devices (dev_eui, device_id, name, battery, rssi, latitude, longitude, gateway_id, created_at)
      VALUES (${dev_eui}, ${device_id}, ${name}, ${battery}, ${rssi}, ${latitude || null}, ${longitude || null}, ${gateway_id}, ${received_at})
      ON CONFLICT (dev_eui) DO UPDATE 
      SET 
        name = EXCLUDED.name,
        battery = EXCLUDED.battery,
        rssi = EXCLUDED.rssi,
        latitude = COALESCE(EXCLUDED.latitude, devices.latitude),
        longitude = COALESCE(EXCLUDED.longitude, devices.longitude),
        gateway_id = EXCLUDED.gateway_id;
    `;

    // B. INSERT new read into `measurements` table
    await sql`
      INSERT INTO measurements (dev_eui, temperature, humidity, co2, presence, estado_id, created_at)
      VALUES (${dev_eui}, ${temperature}, ${humidity}, ${co2}, ${presence}, ${estado_id}, ${received_at});
    `;

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Database Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Database Error' });
  }
} // NOTE: End of webhook handler