'use server'

import { sql } from '../database/db';

export async function getSensorHistory(deviceId: string) {
  try {
    const { rows } = await sql`
      SELECT m.temperature, m.humidity, m.co2, m.created_at
      FROM measurements m
      JOIN devices d ON m.dev_eui = d.dev_eui
      WHERE (UPPER(d.device_id) = UPPER(${deviceId}) OR UPPER(d.dev_eui) = UPPER(${deviceId}))
      AND m.created_at > NOW() - INTERVAL '24 hours'
      ORDER BY m.created_at ASC;
    `;

    return rows.map(row => ({
      time: new Date(row.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Madrid' }),
      value: parseFloat(row.temperature),
      humidity: parseFloat(row.humidity),
      co2: row.co2,
      timestamp: row.created_at
    }));
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
}

export async function getReports(days: number, devEui?: string) {
  try {
    let rows;
    
    if (devEui) {
      ({ rows } = await sql`
        SELECT 
          m.dev_eui,
          date_trunc('hour', m.created_at) AS timestamp,
          AVG(m.temperature) AS temperature,
          AVG(m.humidity) AS humidity,
          AVG(m.co2) AS co2,
          BOOL_OR(m.presence) AS presence
        FROM measurements m
        WHERE m.dev_eui = ${String(devEui).toUpperCase()}
        AND m.created_at >= NOW() - (${days} || ' days')::interval
        GROUP BY m.dev_eui, date_trunc('hour', m.created_at)
        ORDER BY timestamp ASC;
      `);
    } else {
      ({ rows } = await sql`
        SELECT 
          m.dev_eui,
          date_trunc('hour', m.created_at) AS timestamp,
          AVG(m.temperature) AS temperature,
          AVG(m.humidity) AS humidity,
          AVG(m.co2) AS co2,
          BOOL_OR(m.presence) AS presence
        FROM measurements m
        WHERE m.created_at >= NOW() - (${days} || ' days')::interval
        GROUP BY m.dev_eui, date_trunc('hour', m.created_at)
        ORDER BY timestamp ASC;
      `);
    }

    return rows.map(r => ({
      timestamp: r.timestamp,
      temperature: parseFloat(r.temperature) || 0,
      humidity: parseFloat(r.humidity) || 0,
      co2: Math.round(parseFloat(r.co2)) || 0,
      presence: r.presence === true,
      deviceId: r.dev_eui
    }));
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
}
export async function exportSensorDataCSV(deviceIds: string[], startDate?: string, endDate?: string, allData: boolean = false) {
  try {
    let query;
    let values: any[] = [deviceIds];
    
    let baseQuery = `
      SELECT 
        m.created_at, 
        m.dev_eui, 
        d.name as device_name,
        m.temperature, 
        m.humidity, 
        m.co2, 
        m.presence
      FROM measurements m
      JOIN devices d ON m.dev_eui = d.dev_eui
      WHERE m.dev_eui = ANY($1)
    `;

    if (!allData) {
      if (startDate && endDate) {
        baseQuery += ` AND m.created_at >= ($2::date AT TIME ZONE 'Europe/Madrid') 
                       AND m.created_at < ($3::date + interval '1 day' AT TIME ZONE 'Europe/Madrid')`;
        values.push(startDate, endDate);
      } else {
        baseQuery += ` AND m.created_at > NOW() - INTERVAL '24 hours'`;
      }
    }

    baseQuery += ` ORDER BY m.created_at DESC`;

    const { rows } = await sql.query(baseQuery, values);

    // Generate CSV string
    const headers = ["Fecha", "ID Dispositivo", "Nombre Sensor", "Temperatura (°C)", "Humedad (%)", "CO2 (ppm)", "Presencia"];
    const csvContent = [
      headers.join(';'),
      ...rows.map(r => [
        new Date(r.created_at).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }),
        r.dev_eui,
        r.device_name || '',
        r.temperature,
        r.humidity,
        r.co2 || '',
        r.presence ? 'SÍ' : 'NO'
      ].join(';'))
    ].join('\n');

    return csvContent;
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw new Error('Error al generar el reporte CSV');
  }
}
