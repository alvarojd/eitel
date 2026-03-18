import { sql } from './db.js';
import { VercelRequest, VercelResponse } from '../src/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { devEui, days } = req.query || {};
  const numDays = parseInt(String(days)) || 7;

  try {
    // We aggregate by hour to avoid sending too much data to the frontend
    // while maintaining enough resolution for 7/30 day charts.
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
        AND m.created_at >= NOW() - (${numDays} || ' days')::interval
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
        WHERE m.created_at >= NOW() - (${numDays} || ' days')::interval
        GROUP BY m.dev_eui, date_trunc('hour', m.created_at)
        ORDER BY timestamp ASC;
      `);
    }

    const formattedData = rows.map(r => ({
      timestamp: r.timestamp,
      temperature: parseFloat(r.temperature) || 0,
      humidity: parseFloat(r.humidity) || 0,
      co2: Math.round(parseFloat(r.co2)) || 0,
      presence: r.presence === true,
      deviceId: r.dev_eui
    }));

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('Reports API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
