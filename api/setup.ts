import { sql } from '@vercel/postgres';
import { hashPassword } from '../src/utils/auth.js';
import { VercelRequest, VercelResponse } from '../src/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 1. Create table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('ADMIN', 'VIEWER')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

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
