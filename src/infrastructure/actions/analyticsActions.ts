'use server'

import { sql } from '../database/db';

export interface AnalyticsDataPoint {
  timestamp: string;
  value: number;
}

export async function getAnalyticsData(
  devEui: string, 
  startDate: string, 
  endDate: string, 
  variable: string
) {
  try {
    // Validar variable para evitar inyección SQL (aunque usamos parámetros, el nombre de la columna no puede ser parámetro en SQL estándar)
    const allowedVariables = ['temperature', 'humidity', 'co2'];
    if (!allowedVariables.includes(variable)) {
      throw new Error('Variable no permitida');
    }

    // Query dinámico para la columna, pero con parámetros seguros para el resto
    const query = `
      SELECT 
        created_at as timestamp,
        ${variable} as value
      FROM measurements
      WHERE dev_eui = $1
      AND created_at >= ($2 || ' 00:00:00 Europe/Madrid')::timestamptz
      AND created_at < ($3 || ' 00:00:00 Europe/Madrid')::timestamptz + interval '1 day'
      ORDER BY created_at ASC;
    `;

    const { rows } = await sql.query(query, [devEui, startDate, endDate]);

    return rows.map(r => ({
      timestamp: r.timestamp,
      value: parseFloat(r.value) || 0
    }));
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return [];
  }
}
