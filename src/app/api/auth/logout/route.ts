import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { REFRESH_COOKIE_NAME, clearAuthCookies } from '@/lib/cookies';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;

    if (refreshToken) {
      const activeTokens = await prisma.refreshToken.findMany({
        where: { revoked: false },
      });

      for (const tokenRecord of activeTokens) {
        const match = await bcrypt.compare(refreshToken, tokenRecord.hashedToken);
        if (match) {
          await prisma.refreshToken.update({
            where: { id: tokenRecord.id },
            data: { revoked: true },
          });
          break;
        }
      }
    }

    const accept = req.headers.get('accept') || '';
    const response = accept.includes('text/html')
      ? NextResponse.redirect(new URL('/login', req.url), { status: 303 })
      : NextResponse.json({ message: 'Sesión cerrada con éxito' }, { status: 200 });
    clearAuthCookies(response);
    return response;
  } catch (error) {
    console.error('Error en logout:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}