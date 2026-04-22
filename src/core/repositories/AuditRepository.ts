export interface AuditLog {
  id: string;
  username: string;
  action: string;
  details?: string;
  created_at: Date;
}

export interface AuditRepository {
  logAction(userId: string | null, username: string, action: string, details?: string): Promise<void>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
}
