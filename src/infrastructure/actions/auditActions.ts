'use server';

import { getAuditRepository } from '../di/container';
import { cookies, headers } from 'next/headers';
import { verifyToken } from '@/lib/auth';

async function requireSession() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) throw new Error('No autorizado. Sesión expirada o inválida.');
  const session = verifyToken(token);
  if (!session) throw new Error('No autorizado.');
  return session;
}

export async function logAction(
  userId: string | null,
  username: string,
  action: string,
  details?: string
) {
  try {
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    const auditRepository = getAuditRepository();
    await auditRepository.logAction(userId, username, action, details, ipAddress, userAgent);
  } catch (error) {
    console.error('Failed to log action:', error);
  }
}

export async function getAuditLogs(limit: number = 100) {
  await requireSession();
  try {
    const auditRepository = getAuditRepository();
    return await auditRepository.getAuditLogs(limit);
  } catch (error) {
    console.error('Audit Logs Action Error:', error);
    return [];
  }
}
