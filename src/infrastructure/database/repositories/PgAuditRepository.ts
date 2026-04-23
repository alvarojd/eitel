import { AuditRepository, AuditLog } from '../../../core/repositories/AuditRepository';
import { db } from '../db';
import { auditLogs } from '../schema';
import { desc } from 'drizzle-orm';

export class PgAuditRepository implements AuditRepository {
  async logAction(userId: string | null, username: string, action: string, details?: string): Promise<void> {
    await db.insert(auditLogs).values({
      userId,
      username,
      action,
      details: details || null,
    });
  }

  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    const rows = await db.select({
      id: auditLogs.id,
      username: auditLogs.username,
      action: auditLogs.action,
      details: auditLogs.details,
      created_at: auditLogs.createdAt,
    })
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
    
    return rows.map(r => ({
      ...r,
      created_at: r.created_at as unknown as Date,
    })) as unknown as AuditLog[];
  }
}
