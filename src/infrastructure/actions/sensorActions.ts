'use server'

import { SensorState } from '../../core/entities/Sensor';
import { logAction } from './auditActions';
import { z } from 'zod';
import { getSensorRepository } from '../di/container';
import { cookies } from 'next/headers';
import { verifyToken, TokenPayload } from '@/lib/auth';

const UpdateSensorSchema = z.object({
  devEui: z.string().min(1),
  name: z.string().min(1).max(100),
  latitude: z.number().nullable(),
  longitude: z.number().nullable()
});

async function requireAdminSession(): Promise<TokenPayload> {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) throw new Error('No autorizado. Sesión expirada o inválida.');
  const session = verifyToken(token);
  if (!session || session.role !== 'ADMIN') throw new Error('No autorizado. Requiere rol de Administrador.');
  return session;
}

export async function getSensors(): Promise<SensorState[]> {
  try {
    return await getSensorRepository().getSensors();
  } catch (error) {
    console.error('Error in getSensors action:', error);
    return [];
  }
}

export async function updateSensor(
  devEui: string,
  name: string,
  latitude: number | null,
  longitude: number | null
) {
  const session = await requireAdminSession();

  try {
    const validated = UpdateSensorSchema.parse({ devEui, name, latitude, longitude });
    
    await getSensorRepository().updateSensor(validated.devEui, validated.name, validated.latitude, validated.longitude);
    
    await logAction(session.id, session.username, 'UPDATE_SENSOR', `Actualizado sensor ${validated.devEui}: ${validated.name} (${validated.latitude}, ${validated.longitude})`);
    return { success: true };
  } catch (error) {
    console.error('updateSensor Action Error:', error);
    throw new Error('Error al actualizar el sensor');
  }
}

export async function deleteSensorMeasurements(
  devEui: string
) {
  const session = await requireAdminSession();

  try {
    await getSensorRepository().deleteSensorMeasurements(devEui);
    await logAction(session.id, session.username, 'DELETE_MEASUREMENTS', `Borrado historial del sensor ${devEui}`);
    return { success: true };
  } catch (error) {
    console.error('deleteSensorMeasurements Action Error:', error);
    throw new Error('Error al borrar el historial del sensor');
  }
}

export async function deleteSensor(
  devEui: string, 
  includeHistory: boolean = false
) {
  const session = await requireAdminSession();

  try {
    await getSensorRepository().deleteSensor(devEui, includeHistory);
    await logAction(session.id, session.username, 'DELETE_SENSOR', `Eliminado sensor ${devEui} ${includeHistory ? '(incluyendo historial)' : ''}`);
    return { success: true };
  } catch (error) {
    console.error('deleteSensor Action Error:', error);
    throw new Error('Error al eliminar el sensor');
  }
}

