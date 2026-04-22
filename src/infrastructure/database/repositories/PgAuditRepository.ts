import { AuditRepository, AuditLog } from '../../../core/repositories/AuditRepository';
import { sql } from '../db';

export class PgAuditRepository implements AuditRepository {
  async logAction(userId: string | null, username: string, action: string, details?: string): Promise<void> {
    await sql`
      INSERT INTO audit_logs (user_id, username, action, details)
      VALUES (${userId}, ${username}, ${action}, ${details || null})
    `;
  }

  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    const { rows } = await sql`
      SELECT id, username, action, details, created_at 
      FROM audit_logs 
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `;
    return rows as AuditLog[];
  }
}
