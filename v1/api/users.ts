import { sql } from './_db.js';
import { authorize, hashPassword } from '../src/utils/auth.js';
import { VercelRequest, VercelResponse } from '../src/types.js';
import { logAction } from './audit-logs.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // --- Authorization Check ---
  // We allow both ADMIN and VIEWER to access the handler, 
  // but we will enforce strict role checks for each specific method.
  const currentUser = authorize(req, ['ADMIN', 'VIEWER']);
  if (!currentUser) {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere autenticación.' });
  }

  if (req.method === 'GET') {
    // Permission check: Only ADMIN can list all users
    if (currentUser.role !== 'ADMIN') {
      return res.status(403).json({ error: 'No tienes permiso para ver la lista de usuarios.' });
    }
    try {
      const { rows } = await sql`SELECT id, username, role, created_at FROM users ORDER BY username ASC`;
      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  }

  if (req.method === 'POST') {
    // Permission check: Only ADMIN can create new users
    if (currentUser.role !== 'ADMIN') {
      return res.status(403).json({ error: 'No tienes permiso para crear usuarios.' });
    }
    const { username, password, role } = req.body || {};
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    try {
      // Check for duplicate username
      const { rows: existingUser } = await sql`SELECT id FROM users WHERE username = ${username}`;
      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'El nombre de usuario ya existe. Por favor, elige otro.' });
      }

      const passwordHash = await hashPassword(password);
      await sql`
        INSERT INTO users (username, password_hash, role)
        VALUES (${username}, ${passwordHash}, ${role})
      `;
      
      await logAction(currentUser.id, currentUser.username, 'CREATE_USER', `Creado usuario: ${username} (${role})`);
      
      return res.status(201).json({ success: true, message: 'Usuario creado' });
    } catch (error) {
      return res.status(500).json({ error: 'Error al crear usuario.' });
    }
  }

  if (req.method === 'PATCH') {
    const { id, password, role } = req.body || {};
    if (!id) {
      return res.status(400).json({ error: 'El ID de usuario es obligatorio' });
    }

    if (password && password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    // Permission check: Admin can update anyone, Viewer can only update themselves
    if (currentUser.role !== 'ADMIN' && currentUser.id !== id) {
       return res.status(403).json({ error: 'No tienes permiso para actualizar este usuario' });
    }

    try {
      const { rows } = await sql`SELECT username, role FROM users WHERE id = ${id}`;
      if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
      
      const targetUser = rows[0];

      // Protect 'admin' user from role changes
      if (role && targetUser.username === 'admin' && role !== 'ADMIN') {
        return res.status(400).json({ error: 'El usuario "admin" no puede dejar de ser administrador.' });
      }
      
      let updateLogDetails = [];

      if (password) {
        const passwordHash = await hashPassword(password);
        await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${id}`;
        updateLogDetails.push('contraseña');
      }

      if (role && role !== targetUser.role) {
        // Only admins can change roles
        if (currentUser.role !== 'ADMIN') {
          return res.status(403).json({ error: 'Solo los administradores pueden cambiar roles.' });
        }
        await sql`UPDATE users SET role = ${role} WHERE id = ${id}`;
        updateLogDetails.push(`rol (${role})`);
      }

      if (updateLogDetails.length > 0) {
        await logAction(currentUser.id, currentUser.username, 'UPDATE_USER', `Actualizado: ${updateLogDetails.join(', ')} de: ${targetUser.username}`);
      }

      return res.status(200).json({ success: true, message: 'Usuario actualizado' });
    } catch (error) {
      return res.status(500).json({ error: 'Error al actualizar usuario' });
    }
  }

  if (req.method === 'DELETE') {
    // Permission check: Only ADMIN can delete users
    if (currentUser.role !== 'ADMIN') {
      return res.status(403).json({ error: 'No tienes permiso para eliminar usuarios.' });
    }
    const { id } = req.body || req.query || {};
    if (!id) return res.status(400).json({ error: 'ID de usuario es obligatorio' });

    // Rule 1: Cannot delete yourself
    if (id === currentUser.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propio usuario.' });
    }

    try {
      const { rows } = await sql`SELECT id, username, role FROM users WHERE id = ${id}`;
      if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

      const targetUser = rows[0];

      // Rule 2: Cannot delete the 'admin' user (reserved system account)
      if (targetUser.username === 'admin') {
        return res.status(400).json({ error: 'El usuario "admin" es una cuenta protegida del sistema y no puede eliminarse.' });
      }

      // Rule 3: Cannot delete the last admin
      if (targetUser.role === 'ADMIN') {
        const { rows: adminRows } = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN'`;
        const adminCount = parseInt(adminRows[0].count, 10);
        if (adminCount <= 1) {
          return res.status(400).json({ error: 'No puedes eliminar el único administrador del sistema. Crea otro administrador primero.' });
        }
      }

      await sql`DELETE FROM users WHERE id = ${id}`;
      
      await logAction(currentUser.id, currentUser.username, 'DELETE_USER', `Eliminado usuario: ${targetUser.username}`);

      return res.status(200).json({ success: true, message: 'Usuario eliminado' });
    } catch (error) {
      return res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
