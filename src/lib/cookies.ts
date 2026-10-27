import { NextResponse } from 'next/server';

export const ACCESS_COOKIE_NAME = 'cospace_access_token';
export const REFRESH_COOKIE_NAME = 'cospace_refresh_token';

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): void {
  const isProduction = process.env.NODE_ENV === 'production';

  // Access Token: duración de 15 minutos
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: accessToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60,
  });

  // Refresh Token: duración de 7 días
  response.cookies.set({
    name: REFRESH_COOKIE_NAME,
    value: refreshToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
}

export function clearAuthCookies(response: NextResponse): void {
  const isProduction = process.env.NODE_ENV === 'production';

  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  response.cookies.set({
    name: REFRESH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}