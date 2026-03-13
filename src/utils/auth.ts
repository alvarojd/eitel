import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { VercelRequest, VercelResponse } from '../types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only';

export interface AuthUser {
  id: string;
  username: string;
  role: 'ADMIN' | 'VIEWER';
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Middleware-like helper to protect API routes
 */
export function authorize(req: VercelRequest, roles: string[] = []) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return null;
  }

  const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;

  if (!headerValue.startsWith('Bearer ')) {
    return null;
  }

  const token = headerValue.split(' ')[1];
  const user = verifyToken(token);

  if (!user) return null;

  if (roles.length > 0 && !roles.includes(user.role)) {
    return null;
  }

  return user;
}
