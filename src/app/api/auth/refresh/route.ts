import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { verifyRefreshToken, signAccessToken } from '@/lib/jwt';
import { REFRESH_COOKIE_NAME, ACCESS_COOKIE_NAME } from '@/lib/cookies';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;

    if (!refreshToken) {
      return NextResponse.json({ message: 'Refresh token no proporcionado' }, { status: 401 });
    }

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json({ message: 'Refresh token expirado o inválido' }, { status: 401 });
    }

    // Verificar en DB que el token no haya sido revocado
    const activeTokens = await prisma.refreshToken.findMany({
      where: {
        userId: payload.userId,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    let isValid = false;
    for (const record of activeTokens) {
      const match = await bcrypt.compare(refreshToken, record.hashedToken);
      if (match) {
        isValid = true;
        break;
      }
    }

    if (!isValid) {
      return NextResponse.json({ message: 'Token revocado o inválido' }, { status: 401 });
    }

    // Generar nuevo access token
    const newAccessToken = await signAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    const isProduction = process.env.NODE_ENV === 'production';
    const response = NextResponse.json({ message: 'Token renovado exitosamente' }, { status: 200 });

    response.cookies.set({
      name: ACCESS_COOKIE_NAME,
      value: newAccessToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });

    return response;
  } catch (error) {
    console.error('Error en refresh:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}