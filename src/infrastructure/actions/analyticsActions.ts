'use server'

import { PgAnalyticsRepository } from '../database/repositories/PgAnalyticsRepository';

export interface AnalyticsDataPoint {
  timestamp: string;
  value: number;
}

const analyticsRepository = new PgAnalyticsRepository();

export async function getAnalyticsData(
  devEui: string, 
  startDate: string, 
  endDate: string, 
  variable: string
) {
  try {
    // Validar variable para evitar inyección SQL
    const allowedVariables = ['temperature', 'humidity', 'co2'];
    if (!allowedVariables.includes(variable)) {
      throw new Error('Variable no permitida');
    }

    return await analyticsRepository.getAnalyticsData(devEui, startDate, endDate, variable);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return [];
  }
}
