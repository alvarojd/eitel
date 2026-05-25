'use server'

import { getAnalyticsRepository } from '../di/container';
import { z } from 'zod';

export interface AnalyticsDataPoint {
  timestamp: string;
  value: number;
}

const AnalyticsParamsSchema = z.object({
  devEui: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  variable: z.enum(['temperature', 'humidity', 'co2']),
});

export async function getAnalyticsData(
  devEui: string, 
  startDate: string, 
  endDate: string, 
  variable: string
) {
  try {
    const validated = AnalyticsParamsSchema.parse({ devEui, startDate, endDate, variable });

    const analyticsRepository = getAnalyticsRepository();
    return await analyticsRepository.getAnalyticsData(validated.devEui, validated.startDate, validated.endDate, validated.variable);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return [];
  }
}
