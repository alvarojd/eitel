'use server';

import { hashPassword } from '@/lib/auth';
import { logAction } from './auditActions';
import { UserRole } from '@/core/entities/User';
import { PgUserRepository } from '../database/repositories/PgUserRepository';

const userRepository = new PgUserRepository();

export async function getUsers() {
  try {
    const users = await userRepository.getUsers();
    return users.map(u => ({ ...u, created_at: u.created_at.toISOString() }));
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
    const existingUser = await userRepository.getUserByUsername(username);
    if (existingUser) {
      throw new Error('El nombre de usuario ya existe');
    }

    const passwordHash = await hashPassword(password);
    await userRepository.createUser(username, passwordHash, role);
    
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
    const user = await userRepository.getUserById(targetUserId);
    if (!user) throw new Error('Usuario no encontrado');
    
    const passwordHash = await hashPassword(newPassword);
    await userRepository.updateUserPassword(targetUserId, passwordHash);
    
    await logAction(operatorId, operatorUsername, 'UPDATE_USER_PASSWORD', `Actualizada contraseña de: ${user.username}`);
    
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
    const targetUser = await userRepository.getUserById(targetUserId);
    if (!targetUser) throw new Error('Usuario no encontrado');

    // Protected user rules
    if (targetUser.username === 'admin') {
      throw new Error('El usuario "admin" está protegido y no puede eliminarse');
    }

    if (targetUser.role === 'ADMIN') {
      const adminCount = await userRepository.countAdmins();
      if (adminCount <= 1) {
        throw new Error('No puedes eliminar el único administrador del sistema');
      }
    }

    await userRepository.deleteUser(targetUserId);
    
    await logAction(adminId, adminUsername, 'DELETE_USER', `Eliminado usuario: ${targetUser.username}`);

    return { success: true };
  } catch (error: any) {
    console.error('deleteUser Action Error:', error);
    throw error;
  }
}
