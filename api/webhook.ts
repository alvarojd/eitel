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
      temperature DECIMAL(5,2),
      humidity DECIMAL(5,2),
      co2 INTEGER,
      battery INTEGER,
      rssi INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`;

    // 2. Parse TTN Payload
    const { end_device_ids, uplink_message } = req.body;
    const payload = uplink_message?.decoded_payload;
    const rx_metadata = uplink_message?.rx_metadata?.[0]; // Get signal info from first gateway
    
    // Try to get device_id from standard location, fallback to payload if present there
    const device_id = end_device_ids?.device_id || payload?.device_id;

    if (!device_id || !payload) {
      console.warn('Missing device_id or payload', req.body);
      return res.status(400).json({ error: 'Invalid payload: missing device_id or decoded_payload' });
    }

    const temperature = payload.temperature || 0;
    const humidity = payload.humidity || 0;
    
    // Handle Case Sensitivity for CO2
    const co2 = payload.CO2 || payload.co2 || 400;
    
    // Handle Battery Voltage conversion to Percentage
    // Assuming 3.6V/3.7V nominal. Mapping: 3.0V (0%) to 3.6V (100%)
    let battery = 100;
    if (typeof payload.battery_voltage === 'number') {
        const minV = 3.0;
        const maxV = 3.6;
        const voltage = payload.battery_voltage;
        const pct = ((voltage - minV) / (maxV - minV)) * 100;
        battery = Math.min(100, Math.max(0, Math.round(pct)));
    } else if (typeof payload.battery === 'number') {
        battery = payload.battery;
    }

    const rssi = rx_metadata?.rssi || -100;

    // 3. Insert Data
    await sql`
      INSERT INTO measurements (device_id, temperature, humidity, co2, battery, rssi)
      VALUES (${device_id}, ${temperature}, ${humidity}, ${co2}, ${battery}, ${rssi});
    `;

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Database Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Database Error' });
  }
}