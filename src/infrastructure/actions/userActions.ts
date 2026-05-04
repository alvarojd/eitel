'use server';

import { hashPassword } from '@/lib/auth';
import { logAction } from './auditActions';
import { UserRole } from '@/core/entities/User';
import { getUserRepository } from '../di/container';
import { cookies } from 'next/headers';
import { verifyToken, TokenPayload } from '@/lib/auth';

async function requireAdminSession(): Promise<TokenPayload> {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) throw new Error('No autorizado. Sesión expirada o inválida.');
  const session = verifyToken(token);
  if (!session || session.role !== 'ADMIN') throw new Error('No autorizado. Requiere rol de Administrador.');
  return session;
}

async function requireSession(): Promise<TokenPayload> {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) throw new Error('No autorizado. Sesión expirada o inválida.');
  const session = verifyToken(token);
  if (!session) throw new Error('No autorizado.');
  return session;
}

export async function getUsers() {
  try {
    const userRepository = getUserRepository();
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
    const userRepository = getUserRepository();
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
    const userRepository = getUserRepository();
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
    const userRepository = getUserRepository();
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

export async function updateOwnPassword(
  targetUserId: string, 
  newPassword: string
) {
  const session = await requireSession();
  
  // Users can only change their own password unless they're admin
  if (session.role !== 'ADMIN' && session.id !== targetUserId) {
    throw new Error('No autorizado para cambiar la contraseña de otro usuario');
  }

  if (newPassword.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres');
  }

  try {
    const userRepository = getUserRepository();
    const user = await userRepository.getUserById(targetUserId);
    if (!user) throw new Error('Usuario no encontrado');
    
    const passwordHash = await hashPassword(newPassword);
    await userRepository.updateUserPassword(targetUserId, passwordHash);
    
    await logAction(session.id, session.username, 'UPDATE_USER_PASSWORD', `Actualizada contraseña de: ${user.username}`);
    
    return { success: true };
  } catch (error: any) {
    console.error('updateOwnPassword Action Error:', error);
    throw error;
  }
}
