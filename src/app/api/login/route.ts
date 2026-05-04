import { NextResponse } from 'next/server';
import { db } from '@/infrastructure/database/db';
import { users } from '@/infrastructure/database/schema';
import { eq } from 'drizzle-orm';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Faltan credenciales' }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(eq(users.username, username));

    if (!user) {
      return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 });
    }

    const token = generateToken({
      id: user.id,
      username: username,
      role: user.role
    });

    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

    // Set cookie for middleware protection
    response.cookies.set('auth_token', token, {
      httpOnly: true, // Set to true for more security
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;

  } catch (error: any) {
    console.error('Login API Error:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}
