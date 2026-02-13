import { sql } from '@vercel/postgres';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Get the most recent measurement for each unique device
    const { rows } = await sql`
      SELECT DISTINCT ON (device_id) 
        device_id, 
        temperature, 
        humidity, 
        co2, 
        battery, 
        rssi,
        created_at
      FROM measurements
      ORDER BY device_id, created_at DESC;
    `;

    // Calculate "time ago" for lastSeen
    const now = new Date();
    const formattedData = rows.map(row => {
      const diffMs = now.getTime() - new Date(row.created_at).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      let lastSeen = 'Hace un momento';
      
      if (diffMins > 60) {
        lastSeen = `Hace ${Math.floor(diffMins / 60)}h`;
      } else if (diffMins > 0) {
        lastSeen = `Hace ${diffMins}m`;
      }

      return {
        id: row.device_id,
        battery: row.battery,
        temperature: parseFloat(row.temperature),
        humidity: parseFloat(row.humidity),
        co2: row.co2,
        rssi: row.rssi,
        lastSeen: lastSeen,
        timestamp: row.created_at
      };
    });

    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');
    return res.status(200).json(formattedData);

  } catch (error: any) {
    // If table doesn't exist (error code 42P01), return empty array instead of crashing
    if (error.code === '42P01') {
        return res.status(200).json([]);
    }
    console.error('Database Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}