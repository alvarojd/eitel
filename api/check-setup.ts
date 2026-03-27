import { sql } from './db.js';
import { VercelRequest, VercelResponse } from '../src/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Check if 'users' table exists and has an ADMIN
    const result = await sql`
      SELECT COUNT(*) FROM users WHERE role = 'ADMIN'
    `.catch(() => ({ rows: [] }));

    const adminCount = parseInt(result.rows[0]?.count || '0');

    return res.status(200).json({ 
      needsSetup: adminCount === 0 
    });
  } catch (error) {
    // If table doesn't exist, it definitely needs setup
    return res.status(200).json({ 
      needsSetup: true 
    });
  }
}
