'use server';

import { sql } from '../database/db';

export async function logAction(
  userId: string | null,
  username: string,
  action: string,
  details?: string
) {
  try {
    await sql`
      INSERT INTO audit_logs (user_id, username, action, details)
      VALUES (${userId}, ${username}, ${action}, ${details || null})
    `;
  } catch (error) {
    console.error('Failed to log action:', error);
  }
}

export async function getAuditLogs(limit: number = 100) {
  try {
    const { rows } = await sql`
      SELECT id, username, action, details, created_at 
      FROM audit_logs 
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `;
    return rows;
  } catch (error) {
    console.error('Audit Logs Action Error:', error);
    return [];
  }
}
