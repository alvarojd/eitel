import { sql } from './_db.js';
import { VercelRequest, VercelResponse } from '../src/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const deviceId = String(req.query.deviceId || '');

    if (!deviceId) {
        return res.status(400).json({ error: 'Missing deviceId parameter' });
    }

    try {
        // Fetch last 24 hours of measurements for this device
        // Joining devices to allow search by either dev_eui or the user-friendly device_id
        const { rows } = await sql`
      SELECT m.temperature, m.humidity, m.co2, m.created_at
      FROM measurements m
      JOIN devices d ON m.dev_eui = d.dev_eui
      WHERE (UPPER(d.device_id) = UPPER(${deviceId}) OR UPPER(d.dev_eui) = UPPER(${deviceId}))
      AND m.created_at > NOW() - INTERVAL '24 hours'
      ORDER BY m.created_at ASC;
    `;

        // Map to a more friendly format for the chart
        const history = rows.map(row => ({
            time: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            value: parseFloat(row.temperature),
            humidity: parseFloat(row.humidity),
            co2: row.co2,
            timestamp: row.created_at
        }));

        return res.status(200).json(history);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('Database Error:', err);

        const isDev = process.env.NODE_ENV === 'development';
        return res.status(500).json({
            error: 'Internal Server Error',
            ...(isDev && { message: err.message, stack: err.stack }),
        });
    }
}
