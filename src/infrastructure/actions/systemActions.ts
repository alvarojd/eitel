'use server';

import { PgSystemRepository } from '../database/repositories/PgSystemRepository';

const systemRepository = new PgSystemRepository();

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
  if (!newName.trim()) throw new Error('El nombre del proyecto no puede estar vacío');
  
  try {
    await systemRepository.updateProjectName(newName);
    return true;
  } catch (error) {
    console.error('Error updating project name:', error);
    throw new Error('Error al actualizar el nombre del proyecto');
  }
}
