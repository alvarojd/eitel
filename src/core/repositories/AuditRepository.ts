export interface AuditLog {
  id: string;
  username: string;
  action: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  created_at: Date;
}

export interface AuditRepository {
  logAction(userId: string | null, username: string, action: string, details?: string, ipAddress?: string | null, userAgent?: string | null): Promise<void>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
}
