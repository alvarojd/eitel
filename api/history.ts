import { sql } from '@vercel/postgres';

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { deviceId } = req.query;

    if (!deviceId) {
        return res.status(400).json({ error: 'Missing deviceId parameter' });
    }

    try {
        // Fetch last 24 hours of measurements for this device
        const { rows } = await sql`
      SELECT temperature, humidity, co2, created_at
      FROM measurements
      WHERE device_id = ${deviceId}
      AND created_at > NOW() - INTERVAL '24 hours'
      ORDER BY created_at ASC;
    `;

        // Map to a more friendly format for the chart
        const history = rows.map(row => ({
            time: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            value: parseFloat(row.temperature),
            humidity: parseFloat(row.humidity),
            co2: row.co2,
            timestamp: row.created_at
        }));

        return res.status(200).json(history);
    } catch (error: any) {
        console.error('Database Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
