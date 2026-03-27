import { sql } from './db.js';
import { VercelRequest, VercelResponse } from '../src/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { rows } = await sql`SELECT key, value FROM system_settings`.catch(() => ({ rows: [] }));
    const settings = rows.reduce((acc: any, row: any) => {
      acc[row.key] = row.value;
      return acc;
    }, {});

    return res.status(200).json(settings);
  } catch (error) {
    return res.status(200).json({ 
        project_name: 'HexaSense IoT Dashboard',
        default_lat: '40.4168',
        default_lng: '-3.7038'
    });
  }
}
