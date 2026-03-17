import { sql } from './db.js';
import { authorize } from '../src/utils/auth.js';
import { VercelRequest, VercelResponse } from '../src/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // --- Admin Authorization Only ---
  const currentUser = authorize(req, ['ADMIN']);
  if (!currentUser) {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await sql`
        SELECT id, username, action, details, created_at 
        FROM audit_logs 
        ORDER BY created_at DESC 
        LIMIT 100
      `;
      return res.status(200).json(rows);
    } catch (error) {
      console.error('Audit Logs API Error:', error);
      return res.status(500).json({ error: 'Error al obtener registros de auditoría' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}

export async function logAction(userId: string, username: string, action: string, details?: string) {
  try {
    await sql`
      INSERT INTO audit_logs (user_id, username, action, details)
      VALUES (${userId}, ${username}, ${action}, ${details || null})
    `;
  } catch (error) {
    console.error('Failed to log action:', error);
  }
}
