'use server';

import { PgAuditRepository } from '../database/repositories/PgAuditRepository';

const auditRepository = new PgAuditRepository();

export async function logAction(
  userId: string | null,
  username: string,
  action: string,
  details?: string
) {
  try {
    await auditRepository.logAction(userId, username, action, details);
  } catch (error) {
    console.error('Failed to log action:', error);
  }
}

export async function getAuditLogs(limit: number = 100) {
  try {
    return await auditRepository.getAuditLogs(limit);
  } catch (error) {
    console.error('Audit Logs Action Error:', error);
    return [];
  }
}
