import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserRole } from '@/core/entities/User';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'FATAL: JWT_SECRET environment variable is required.\n' +
      'Set it in .env.local as JWT_SECRET=your_secret_here'
    );
  }
  return secret;
}

export interface TokenPayload {
  id: string;
  username: string;
  role: UserRole;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(
    payload,
    getJwtSecret(),
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as TokenPayload;
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
