import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWTEu } from './lib/auth-edge';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const decoded = token ? await verifyJWTEu(token) : null;
  const { pathname } = request.nextUrl;

  // Define public paths
  const isPublicPath = pathname === '/login' || pathname.startsWith('/api/login');
  
  // Also allow static files and favicon
  if (
    pathname.includes('.') || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/webhook')
  ) {
    return NextResponse.next();
  }

  if (!decoded && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (decoded && isPublicPath && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
