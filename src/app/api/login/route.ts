import { NextResponse } from 'next/server';
import { getUserRepository } from '@/infrastructure/di/container';
import { comparePassword, generateToken } from '@/lib/auth';
import { UserRole } from '@/core/entities/User';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Faltan credenciales' }, { status: 400 });
    }

    const userRepository = getUserRepository();
    const userCredentials = await userRepository.getUserCredentialsByUsername(username);

    if (!userCredentials) {
      return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 });
    }

    const isValid = await comparePassword(password, userCredentials.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 });
    }

    const token = generateToken({
      id: userCredentials.id,
      username: userCredentials.username,
      role: userCredentials.role as UserRole
    });

    const response = NextResponse.json({
      token,
      user: {
        id: userCredentials.id,
        username: userCredentials.username,
        role: userCredentials.role as UserRole
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
