'use server';

import { getAuditRepository } from '../di/container';

export async function logAction(
  userId: string | null,
  username: string,
  action: string,
  details?: string
) {
  try {
    const auditRepository = getAuditRepository();
    await auditRepository.logAction(userId, username, action, details);
  } catch (error) {
    console.error('Failed to log action:', error);
  }
}

export async function getAuditLogs(limit: number = 100) {
  try {
    const auditRepository = getAuditRepository();
    return await auditRepository.getAuditLogs(limit);
  } catch (error) {
    console.error('Audit Logs Action Error:', error);
    return [];
  }
}
