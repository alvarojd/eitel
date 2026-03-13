import { sql } from '@vercel/postgres';
import { comparePassword, generateToken } from '../src/utils/auth.js';
import { VercelRequest, VercelResponse } from '../src/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }

  try {
    const { rows } = await sql`SELECT * FROM users WHERE username = ${username}`;
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role
    });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error: any) {
    console.error('Login Error:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message,
      hint: 'Asegúrate de haber inicializado la base de datos visitando /api/setup'
    });
  }
}
