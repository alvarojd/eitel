import { sql } from './db.js';
import { hashPassword } from '../src/utils/auth.js';
import { VercelRequest, VercelResponse } from '../src/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 1. Create tables if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('ADMIN', 'VIEWER')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        username TEXT,
        action TEXT NOT NULL,
        details TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS devices (
        dev_eui TEXT PRIMARY KEY,
        device_id TEXT NOT NULL,
        name TEXT,
        battery INTEGER DEFAULT 100,
        rssi INTEGER DEFAULT -100,
        snr DECIMAL DEFAULT 0,
        latitude DECIMAL,
        longitude DECIMAL,
        gateway_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS measurements (
        id BIGSERIAL PRIMARY KEY,
        dev_eui TEXT REFERENCES devices(dev_eui) ON DELETE CASCADE,
        temperature DECIMAL NOT NULL,
        humidity DECIMAL NOT NULL,
        co2 INTEGER NOT NULL,
        presence BOOLEAN DEFAULT FALSE,
        estado_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Optimización: Índices para mejorar el rendimiento
    await sql`CREATE INDEX IF NOT EXISTS idx_measurements_dev_eui_time ON measurements (dev_eui, created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_measurements_time ON measurements (created_at DESC)`;

    // Seguridad: Activar Row Level Security (RLS)
    await sql`ALTER TABLE users ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE devices ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE measurements ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY`;

    // Políticas de seguridad (Para quitar advertencias en Supabase)
    await sql`DROP POLICY IF EXISTS "Deny all public access" ON users`;
    await sql`CREATE POLICY "Deny all public access" ON users FOR ALL USING (false)`;

    await sql`DROP POLICY IF EXISTS "Deny all public access" ON devices`;
    await sql`CREATE POLICY "Deny all public access" ON devices FOR ALL USING (false)`;

    await sql`DROP POLICY IF EXISTS "Deny all public access" ON measurements`;
    await sql`CREATE POLICY "Deny all public access" ON measurements FOR ALL USING (false)`;

    await sql`DROP POLICY IF EXISTS "Deny all public access" ON audit_logs`;
    await sql`CREATE POLICY "Deny all public access" ON audit_logs FOR ALL USING (false)`;

    // Normalización de IDs existentes
    await sql`UPDATE devices SET device_id = LOWER(device_id)`;

    // 2. Check if admin exists
    const { rows } = await sql`SELECT * FROM users WHERE username = 'admin'`;
    
    if (rows.length === 0) {
      const passwordHash = await hashPassword('PepitoCAOS');
      await sql`
        INSERT INTO users (username, password_hash, role)
        VALUES ('admin', ${passwordHash}, 'ADMIN')
      `;
      return res.status(200).json({ 
        success: true, 
        message: 'Base de datos inicializada. Usuario "admin" creado.' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'La base de datos ya estaba inicializada.' 
    });

  } catch (error: any) {
    console.error('Setup Error:', error);
    return res.status(500).json({ 
        error: 'Error al inicializar la base de datos',
        details: error.message 
    });
  }
}
