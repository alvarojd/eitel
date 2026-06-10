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

export async function updateSystemSettingsAction(settings: Record<string, string>): Promise<boolean> {
  await requireAdminSession();
  
  try {
    await systemRepository.updateSystemSettings(settings);
    return true;
  } catch (error) {
    console.error('Error updating system settings:', error);
    throw new Error('Error al actualizar la configuración del sistema');
  }
}

export async function getParsedThresholds() {
  const settings = await getSystemSettings();
  
  const parseSetting = (key: string) => {
    const val = settings[key];
    return val !== undefined && val !== '' ? parseFloat(val) : undefined;
  };

  return {
    TEMP_CRITICAL_LOW: parseSetting('threshold_temp_critical_low'),
    TEMP_CRITICAL_HIGH: parseSetting('threshold_temp_critical_high'),
    TEMP_WARNING_LOW: parseSetting('threshold_temp_warning_low'),
    CO2_CRITICAL: parseSetting('threshold_co2_critical'),
    CO2_WARNING: parseSetting('threshold_co2_warning'),
    HUM_WARNING_HIGH: parseSetting('threshold_hum_warning_high'),
    HUM_WARNING_LOW: parseSetting('threshold_hum_warning_low'),
  };
}
