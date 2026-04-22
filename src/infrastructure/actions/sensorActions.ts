'use server'

import { SensorState } from '../../core/entities/Sensor';
import { logAction } from './auditActions';
import { z } from 'zod';
import { PgSensorRepository } from '../database/repositories/PgSensorRepository';

const UpdateSensorSchema = z.object({
  devEui: z.string().min(1),
  name: z.string().min(1).max(100),
  latitude: z.number().nullable(),
  longitude: z.number().nullable()
});

const sensorRepository = new PgSensorRepository();

export async function getSensors(): Promise<SensorState[]> {
  try {
    return await sensorRepository.getSensors();
  } catch (error) {
    console.error('Error in getSensors action:', error);
    return [];
  }
}

export async function updateSensor(
  adminId: string,
  adminUsername: string,
  devEui: string,
  name: string,
  latitude: number | null,
  longitude: number | null
) {
  try {
    const validated = UpdateSensorSchema.parse({ devEui, name, latitude, longitude });
    
    await sensorRepository.updateSensor(validated.devEui, validated.name, validated.latitude, validated.longitude);
    
    await logAction(adminId, adminUsername, 'UPDATE_SENSOR', `Actualizado sensor ${validated.devEui}: ${validated.name} (${validated.latitude}, ${validated.longitude})`);
    return { success: true };
  } catch (error) {
    console.error('updateSensor Action Error:', error);
    throw new Error('Error al actualizar el sensor');
  }
}

export async function deleteSensorMeasurements(
  adminId: string,
  adminUsername: string,
  devEui: string
) {
  try {
    await sensorRepository.deleteSensorMeasurements(devEui);
    await logAction(adminId, adminUsername, 'DELETE_MEASUREMENTS', `Borrado historial del sensor ${devEui}`);
    return { success: true };
  } catch (error) {
    console.error('deleteSensorMeasurements Action Error:', error);
    throw new Error('Error al borrar el historial del sensor');
  }
}

export async function deleteSensor(
  adminId: string,
  adminUsername: string,
  devEui: string, 
  includeHistory: boolean = false
) {
  try {
    await sensorRepository.deleteSensor(devEui, includeHistory);
    await logAction(adminId, adminUsername, 'DELETE_SENSOR', `Eliminado sensor ${devEui} ${includeHistory ? '(incluyendo historial)' : ''}`);
    return { success: true };
  } catch (error) {
    console.error('deleteSensor Action Error:', error);
    throw new Error('Error al eliminar el sensor');
  }
}

