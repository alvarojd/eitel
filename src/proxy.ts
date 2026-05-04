import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWTEu } from './lib/auth-edge';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const decoded = token ? await verifyJWTEu(token) : null;
  const { pathname } = request.nextUrl;

  // Define public paths
  const isPublicPath = pathname === '/login' || pathname.startsWith('/api/login') || pathname.startsWith('/api/webhook');

  if (isPublicPath) {
    if (decoded && pathname === '/login') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!decoded) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
