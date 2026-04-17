'use server';

import { sql } from '../database/db';
import { hashPassword } from '@/lib/auth';
import { logAction } from './auditActions';
import { UserRole } from '@/core/entities/User';

export async function getUsers() {
  try {
    const { rows } = await sql`
      SELECT id, username, role, created_at 
      FROM users 
      ORDER BY username ASC
    `;
    return rows;
  } catch (error) {
    console.error('getUsers Action Error:', error);
    return [];
  }
}

export async function createUser(
  adminId: string,
  adminUsername: string,
  username: string, 
  password: string, 
  role: UserRole
) {
  if (password.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres');
  }

  try {
    // Check for duplicate username
    const { rows: existingUser } = await sql`SELECT id FROM users WHERE username = ${username}`;
    if (existingUser.length > 0) {
      throw new Error('El nombre de usuario ya existe');
    }

    const passwordHash = await hashPassword(password);
    await sql`
      INSERT INTO users (username, password_hash, role)
      VALUES (${username}, ${passwordHash}, ${role})
    `;
    
    await logAction(adminId, adminUsername, 'CREATE_USER', `Creado usuario: ${username} (${role})`);
    
    return { success: true };
  } catch (error: any) {
    console.error('createUser Action Error:', error);
    throw error;
  }
}

export async function updateUserPassword(
  operatorId: string,
  operatorUsername: string,
  targetUserId: string, 
  newPassword: string
) {
  if (newPassword.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres');
  }

  try {
    const { rows } = await sql`SELECT username FROM users WHERE id = ${targetUserId}`;
    if (rows.length === 0) throw new Error('Usuario no encontrado');
    
    const targetUsername = rows[0].username;
    const passwordHash = await hashPassword(newPassword);

    await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${targetUserId}`;
    
    await logAction(operatorId, operatorUsername, 'UPDATE_USER_PASSWORD', `Actualizada contraseña de: ${targetUsername}`);
    
    return { success: true };
  } catch (error: any) {
    console.error('updateUserPassword Action Error:', error);
    throw error;
  }
}

export async function deleteUser(
  adminId: string,
  adminUsername: string,
  targetUserId: string
) {
  if (adminId === targetUserId) {
    throw new Error('No puedes eliminar tu propio usuario');
  }

  try {
    const { rows } = await sql`SELECT username, role FROM users WHERE id = ${targetUserId}`;
    if (rows.length === 0) throw new Error('Usuario no encontrado');

    const targetUser = rows[0];

    // Protected user rules
    if (targetUser.username === 'admin') {
      throw new Error('El usuario "admin" está protegido y no puede eliminarse');
    }

    if (targetUser.role === 'ADMIN') {
      const { rows: adminRows } = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN'`;
      if (parseInt(adminRows[0].count) <= 1) {
        throw new Error('No puedes eliminar el único administrador del sistema');
      }
    }

    await sql`DELETE FROM users WHERE id = ${targetUserId}`;
    
    await logAction(adminId, adminUsername, 'DELETE_USER', `Eliminado usuario: ${targetUser.username}`);

    return { success: true };
  } catch (error: any) {
    console.error('deleteUser Action Error:', error);
    throw error;
  }
}
