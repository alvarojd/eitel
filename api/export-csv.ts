import { sql } from './db.js';
import { VercelRequest, VercelResponse } from '../src/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { devEui, startDate, endDate } = req.query || {};

  try {
    let query = sql`
      SELECT d.name, m.dev_eui, m.temperature, m.humidity, m.co2, m.presence, m.created_at
      FROM measurements m
      JOIN devices d ON m.dev_eui = d.dev_eui
      WHERE 1=1
    `;

    // Note: vercel/postgres sql template tag doesn't support conditional fragments easily without losing safety or using raw
    // For simplicity and safety in this context, we will use a more standard approach if needed, 
    // but here we can just build the where clause.
    
    // Actually, let's use a simpler approach for the export since it's a specific requirement.
    
    let rows;
    if (devEui && startDate && endDate) {
        ({ rows } = await sql`
            SELECT d.name, m.dev_eui, m.temperature, m.humidity, m.co2, m.presence, m.created_at
            FROM measurements m
            JOIN devices d ON m.dev_eui = d.dev_eui
            WHERE m.dev_eui = ${String(devEui).toUpperCase()}
            AND m.created_at >= ${String(startDate)}
            AND m.created_at <= ${String(endDate)}
            ORDER BY m.created_at DESC
        `);
    } else if (devEui) {
        ({ rows } = await sql`
            SELECT d.name, m.dev_eui, m.temperature, m.humidity, m.co2, m.presence, m.created_at
            FROM measurements m
            JOIN devices d ON m.dev_eui = d.dev_eui
            WHERE m.dev_eui = ${String(devEui).toUpperCase()}
            ORDER BY m.created_at DESC
        `);
    } else if (startDate && endDate) {
        ({ rows } = await sql`
            SELECT d.name, m.dev_eui, m.temperature, m.humidity, m.co2, m.presence, m.created_at
            FROM measurements m
            JOIN devices d ON m.dev_eui = d.dev_eui
            WHERE m.created_at >= ${String(startDate)}
            AND m.created_at <= ${String(endDate)}
            ORDER BY m.created_at DESC
        `);
    } else {
        ({ rows } = await sql`
            SELECT d.name, m.dev_eui, m.temperature, m.humidity, m.co2, m.presence, m.created_at
            FROM measurements m
            JOIN devices d ON m.dev_eui = d.dev_eui
            ORDER BY m.created_at DESC
            LIMIT 5000
        `);
    }

    // Convert to CSV
    const header = 'Timestamp;Device Name;DevEUI;Temperature;Humidity;CO2;Presence\n';
    const csv = rows.map(r => 
      `${r.created_at};${r.name};${r.dev_eui};${r.temperature};${r.humidity};${r.co2};${r.presence}`
    ).join('\n');

    const fullCsv = header + csv;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=iot_data_export.csv');
    return res.status(200).send(fullCsv);

  } catch (error) {
    console.error('Export Error:', error);
    return res.status(500).json({ error: 'Error al exportar datos' });
  }
}
