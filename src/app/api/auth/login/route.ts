import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { setAuthCookies } from '@/lib/cookies';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Credenciales incompletas' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Generar tokens asíncronos con jose
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    // Guardar el refresh token hasheado en la base de datos
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        hashedToken: hashedRefreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Construir la respuesta sin enviar tokens en el body
    const response = NextResponse.json(
      {
        message: 'Inicio de sesión exitoso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // Inyectar cookies HttpOnly seguras
    setAuthCookies(response, accessToken, refreshToken);

    return response;
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}