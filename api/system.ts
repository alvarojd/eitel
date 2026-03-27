import { sql } from './_db.js';
import { hashPassword } from '../src/utils/auth.js';
import { VercelRequest, VercelResponse } from '../src/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = req.query.action;

  // 1. GET /api/system?action=check
  if (req.method === 'GET' && action === 'check') {
    try {
      const result = await sql`
        SELECT COUNT(*) FROM users WHERE role = 'ADMIN'
      `.catch(() => ({ rows: [] }));

      const adminCount = parseInt(result.rows[0]?.count || '0');
      return res.status(200).json({ needsSetup: adminCount === 0 });
    } catch (error) {
      return res.status(200).json({ needsSetup: true });
    }
  }

  // 2. GET /api/system?action=getSettings
  if (req.method === 'GET' && action === 'getSettings') {
    try {
      const { rows } = await sql`SELECT key, value FROM system_settings`.catch(() => ({ rows: [] }));
      const settings = rows.reduce((acc: any, row: any) => {
        acc[row.key] = row.value;
        return acc;
      }, {});
      return res.status(200).json(settings);
    } catch (error) {
      return res.status(200).json({ 
          project_name: 'HexaSense IoT Dashboard',
          default_lat: '40.4168',
          default_lng: '-3.7038'
      });
    }
  }

  // 3. POST /api/system?action=setup
  if (req.method === 'POST' && action === 'setup') {
    // SECURITY LOCK: If any ADMIN exists, block setup
    try {
      const adminCheck = await sql`SELECT 1 FROM users WHERE role = 'ADMIN' LIMIT 1`.catch(() => ({ rows: [] }));
      if (adminCheck.rows.length > 0) {
        return res.status(403).json({ 
          error: 'Forbidden', 
          message: 'El sistema ya ha sido inicializado.' 
        });
      }
    } catch (e) {}

    const { 
      adminPassword, 
      projectName, 
      ttnAppId, 
      ttnApiKey, 
      defaultLat, 
      defaultLng 
    } = req.body;

    if (!adminPassword || !projectName) {
      return res.status(400).json({ error: 'Faltan parámetros obligatorios' });
    }

    try {
      // Create tables
      await sql`CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('ADMIN', 'VIEWER')), created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);`;
      await sql`CREATE TABLE IF NOT EXISTS system_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);`;
      await sql`CREATE TABLE IF NOT EXISTS audit_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES users(id) ON DELETE SET NULL, username TEXT, action TEXT NOT NULL, details TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);`;
      await sql`CREATE TABLE IF NOT EXISTS devices (dev_eui TEXT PRIMARY KEY, device_id TEXT NOT NULL, name TEXT, battery INTEGER DEFAULT 100, rssi INTEGER DEFAULT -100, snr DECIMAL DEFAULT 0, latitude DECIMAL, longitude DECIMAL, gateway_id TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);`;
      await sql`CREATE TABLE IF NOT EXISTS measurements (id BIGSERIAL PRIMARY KEY, dev_eui TEXT REFERENCES devices(dev_eui) ON DELETE CASCADE, temperature DECIMAL NOT NULL, humidity DECIMAL NOT NULL, co2 INTEGER NOT NULL, presence BOOLEAN DEFAULT FALSE, estado_id INTEGER NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_measurements_dev_eui_time ON measurements (dev_eui, created_at DESC);`;
      
      const passwordHash = await hashPassword(adminPassword);
      await sql`INSERT INTO users (username, password_hash, role) VALUES ('admin', ${passwordHash}, 'ADMIN') ON CONFLICT DO NOTHING;`;

      const settings = [
        { key: 'project_name', value: projectName },
        { key: 'ttn_app_id', value: ttnAppId || '' },
        { key: 'ttn_api_key', value: ttnApiKey || '' },
        { key: 'default_lat', value: String(defaultLat || '40.4168') },
        { key: 'default_lng', value: String(defaultLng || '-3.7038') }
      ];

      for (const s of settings) {
        await sql`INSERT INTO system_settings (key, value) VALUES (${s.key}, ${s.value}) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;`;
      }

      return res.status(200).json({ success: true, message: 'Instalación completada.' });
    } catch (error: any) {
      return res.status(500).json({ error: 'Error de inicialización', details: error.message });
    }
  }

  return res.status(404).json({ error: 'Action not found' });
}
