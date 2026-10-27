import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { ACCESS_COOKIE_NAME } from '@/lib/cookies';

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(ACCESS_COOKIE_NAME)?.value;

  let user: DecodedToken | null = null;

  if (token) {
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_ACCESS_SECRET || 'fallback_secret'
      );
      const { payload } = await jwtVerify(token, secret);
      user = payload as unknown as DecodedToken;
    } catch {
      user = null;
    }
  }

  // Rutas que requieren autenticación general 
  const isPrivatePath = pathname.startsWith('/dashboard') || pathname.startsWith('/reservas');
  const isAdminPath = pathname.startsWith('/admin');
  const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/register');

  // 1. Redirigir a login si intenta entrar a rutas privadas o de admin sin sesión
  if ((isPrivatePath || isAdminPath) && !user) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Si no es ADMIN e intenta ingresar al panel de admin, redirigir al dashboard
  if (isAdminPath && user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // 3. Si ya tiene sesión activa e intenta ir a login o registro, enviarlo al dashboard
  if (isAuthPath && user) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/reservas/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};