'use server';

import { sql } from '../database/db';

export async function getSystemSettings(): Promise<Record<string, string>> {
  try {
    const { rows } = await sql<{ key: string, value: string }>`SELECT key, value FROM system_settings`.catch(() => ({ rows: [] }));
    return rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, string>);
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
    await sql`
      INSERT INTO system_settings (key, value) 
      VALUES ('project_name', ${newName})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
    return true;
  } catch (error) {
    console.error('Error updating project name:', error);
    throw new Error('Error al actualizar el nombre del proyecto');
  }
}
