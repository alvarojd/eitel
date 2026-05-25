import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    },
  });
}
