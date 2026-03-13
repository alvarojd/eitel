import { sql } from '@vercel/postgres';
import { authorize, hashPassword } from '../src/utils/auth.js';
import { VercelRequest, VercelResponse } from '../src/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // --- Admin Authorization Only ---
  const currentUser = authorize(req, ['ADMIN']);
  if (!currentUser) {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await sql`SELECT id, username, role, created_at FROM users ORDER BY username ASC`;
      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  }

  if (req.method === 'POST') {
    const { username, password, role } = req.body || {};
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    try {
      const passwordHash = await hashPassword(password);
      await sql`
        INSERT INTO users (username, password_hash, role)
        VALUES (${username}, ${passwordHash}, ${role})
      `;
      return res.status(201).json({ success: true, message: 'Usuario creado' });
    } catch (error) {
      return res.status(500).json({ error: 'Error al crear usuario. Posiblemente el nombre de usuario ya existe.' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || req.query || {};
    if (!id) return res.status(400).json({ error: 'ID de usuario es obligatorio' });

    if (id === currentUser.id) {
      return res.status(400).json({ error: 'No puedes borrar tu propio usuario administrador' });
    }

    try {
      await sql`DELETE FROM users WHERE id = ${id}`;
      return res.status(200).json({ success: true, message: 'Usuario eliminado' });
    } catch (error) {
      return res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
