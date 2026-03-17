import { sql } from './db.js';
import { VercelRequest, VercelResponse } from '../src/types.js';
import { determineStatus } from '../src/utils/statusEngine.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Fetch last 24 hours of measurements, aggregated by device and hour
        const { rows } = await sql`
            WITH date_series AS (
                SELECT generate_series(
                    date_trunc('hour', NOW() - INTERVAL '23 hours'),
                    date_trunc('hour', NOW()),
                    '1 hour'
                ) AS hour
            ),
            device_hours AS (
                SELECT d.device_id, d.dev_eui, d.name, ds.hour
                FROM devices d
                CROSS JOIN date_series ds
            ),
            aggregated_measurements AS (
                SELECT 
                    d.dev_eui,
                    date_trunc('hour', m.created_at) AS hour,
                    AVG(m.temperature) AS avg_temp,
                    AVG(m.humidity) AS avg_hum,
                    AVG(m.co2) AS avg_co2,
                    BOOL_OR(m.presence) AS any_presence,
                    COUNT(m.id) as read_count
                FROM devices d
                LEFT JOIN measurements m ON d.dev_eui = m.dev_eui
                WHERE m.created_at >= date_trunc('hour', NOW() - INTERVAL '23 hours')
                GROUP BY d.dev_eui, date_trunc('hour', m.created_at)
            )
            SELECT 
                dh.device_id,
                dh.dev_eui,
                dh.name,
                dh.hour as timestamp,
                am.avg_temp as temperature,
                am.avg_hum as humidity,
                am.avg_co2 as co2,
                am.any_presence as presence,
                am.read_count
            FROM device_hours dh
            LEFT JOIN aggregated_measurements am 
                ON dh.dev_eui = am.dev_eui AND dh.hour = am.hour
            ORDER BY dh.name ASC, dh.hour ASC;
        `;

        // Transform results into HeatmapDeviceRow array
        const heatmapMap = new Map<string, any>();

        for (const row of rows) {
            const devId = row.device_id || row.dev_eui;
            if (!heatmapMap.has(devId)) {
                heatmapMap.set(devId, {
                    deviceId: devId,
                    name: row.name || devId,
                    data: []
                });
            }

            const deviceEntry = heatmapMap.get(devId);
            
            let estado_id = 0; // Desconocido o sin datos
            let hasData = false;

            if (row.read_count > 0) {
                hasData = true;
                estado_id = determineStatus({
                    temperature: parseFloat(row.temperature) || 0,
                    humidity: parseFloat(row.humidity) || 0,
                    co2: parseFloat(row.co2) || 0
                });
            }

            deviceEntry.data.push({
                timestamp: row.timestamp,
                estado_id: estado_id,
                hasData: hasData,
                presence: row.presence === true
            });
        }

        const heatmapData = Array.from(heatmapMap.values());
        
        return res.status(200).json(heatmapData);
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
