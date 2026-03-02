import { sql } from '@vercel/postgres';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. Ensure Table Exists (Auto-setup)
    await sql`CREATE TABLE IF NOT EXISTS measurements (
      id SERIAL PRIMARY KEY,
      device_id VARCHAR(255) NOT NULL,
      dev_eui VARCHAR(255),
      name VARCHAR(255),
      temperature DECIMAL(5,2),
      humidity DECIMAL(5,2),
      co2 INTEGER,
      battery INTEGER,
      rssi INTEGER,
      presence BOOLEAN DEFAULT FALSE,
      latitude DECIMAL(10,8),
      longitude DECIMAL(11,8),
      gateway_id VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`;

    // Self-healing migration for existing tables
    await sql`ALTER TABLE measurements ADD COLUMN IF NOT EXISTS dev_eui VARCHAR(255);`;
    await sql`ALTER TABLE measurements ADD COLUMN IF NOT EXISTS name VARCHAR(255);`;
    await sql`ALTER TABLE measurements ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);`;
    await sql`ALTER TABLE measurements ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);`;
    await sql`ALTER TABLE measurements ADD COLUMN IF NOT EXISTS gateway_id VARCHAR(255);`;

    // 2. Parse TTN Payload
    const { end_device_ids, uplink_message } = req.body;
    const payload = uplink_message?.decoded_payload;
    const rx_metadata = uplink_message?.rx_metadata;
    const received_at = uplink_message?.received_at || new Date().toISOString();

    const device_id = (end_device_ids?.device_id || payload?.device_id)?.toUpperCase();
    const dev_eui = end_device_ids?.dev_eui?.toUpperCase();
    // Use the friendly device ID as name
    const name = end_device_ids?.device_id;

    if (!device_id || !payload) {
      console.warn('Missing device_id or payload', req.body);
      return res.status(400).json({ error: 'Invalid payload: missing device_id or decoded_payload' });
    }

    const temperature = payload.temperature || 0;
    const humidity = payload.humidity || 0;
    const co2 = payload.CO2 || 0;
    const presence = payload.presence === true;

    // Handle Coordinates and Gateway ID
    // Priority:
    // 1. Decoded Payload (Sensor-reported GPS)
    // 2. Uplink Message Locations (Registry-set or other sources)
    // 3. rx_metadata (Gateway location as fallback)

    let latitude = payload.latitude || payload.lat || payload.gps_lat;
    let longitude = payload.longitude || payload.lon || payload.lng || payload.gps_lng;

    // Check TTN Location registry if not in payload
    const locations = uplink_message?.locations;
    if (!latitude && locations) {
      // Check user-set location or other available sources
      const locSource = locations.user || locations['frm-payload'] || Object.values(locations)[0];
      if (locSource) {
        latitude = (locSource as any).latitude;
        longitude = (locSource as any).longitude;
      }
    }

    let gateway_id = null;

    if (rx_metadata && rx_metadata.length > 0) {
      // Find the best RSSI gateway 
      const bestGw = rx_metadata.reduce((prev: any, curr: any) =>
        ((prev.rssi || -200) > (curr.rssi || -200)) ? prev : curr
      );

      gateway_id = bestGw.gateway_ids?.gateway_id || bestGw.packet_id;

      // Fallback to gateway location only if still NO individual coordinates found
      if (!latitude && bestGw.location) {
        latitude = bestGw.location.latitude;
        longitude = bestGw.location.longitude;
      }
    }

    // Handle Battery Voltage conversion to Percentage
    let battery = 100;
    if (typeof payload.battery_voltage === 'number') {
      const minV = 3.0;
      const maxV = 3.6;
      const voltage = payload.battery_voltage;
      const pct = ((voltage - minV) / (maxV - minV)) * 100;
      battery = Math.min(100, Math.max(0, Math.round(pct)));
    }

    const rssi = rx_metadata?.[0]?.rssi || -100;

    // 3. Insert Data
    await sql`
      INSERT INTO measurements (device_id, dev_eui, name, temperature, humidity, co2, battery, rssi, presence, latitude, longitude, gateway_id, created_at)
      VALUES (${device_id}, ${dev_eui}, ${name}, ${temperature}, ${humidity}, ${co2}, ${battery}, ${rssi}, ${presence}, ${latitude}, ${longitude}, ${gateway_id}, ${received_at});
    `;

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Database Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Database Error' });
  }
}