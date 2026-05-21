'use server';

import { PgSystemRepository } from '../database/repositories/PgSystemRepository';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

const systemRepository = new PgSystemRepository();

async function requireAdminSession() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) throw new Error('No autorizado. Sesión expirada o inválida.');
  const session = verifyToken(token);
  if (!session || session.role !== 'ADMIN') {
    throw new Error('No autorizado. Requiere rol de Administrador.');
  }
  return session;
}

export async function getSystemSettings(): Promise<Record<string, string>> {
  try {
    return await systemRepository.getSystemSettings();
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return {
      project_name: 'Hexasense IoT Dashboard'
    };
  }
}

export async function getProjectName(): Promise<string> {
  try {
    const settings = await getSystemSettings();
    return settings.project_name || 'Hexasense IoT Dashboard';
  } catch (error) {
    return 'Hexasense IoT Dashboard';
  }
}

export async function updateProjectName(newName: string): Promise<boolean> {
  await requireAdminSession();
  
  if (!newName.trim()) throw new Error('El nombre del proyecto no puede estar vacío');
  
  try {
    await systemRepository.updateProjectName(newName);
    return true;
  } catch (error) {
    console.error('Error updating project name:', error);
    throw new Error('Error al actualizar el nombre del proyecto');
  }
}
