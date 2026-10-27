import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession, hasRole } from '@/lib/auth';
import { Role, SpaceType } from '@prisma/client';

export async function GET() {
  try {
    const spaces = await prisma.space.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(spaces, { status: 200 });
  } catch (error) {
    console.error('Error al obtener espacios:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }
    if (!hasRole(session, Role.ADMIN)) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, type, capacity, pricePerHour, imageUrl } = body;

    if (!name || !description || !type || !capacity || !pricePerHour || !imageUrl) {
      return NextResponse.json(
        { message: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    if (!Object.values(SpaceType).includes(type)) {
      return NextResponse.json(
        { message: 'Tipo de espacio inválido' },
        { status: 400 }
      );
    }

    const space = await prisma.space.create({
      data: {
        name,
        description,
        type,
        capacity: Number(capacity),
        pricePerHour: Number(pricePerHour),
        imageUrl,
        isActive: true,
      },
    });

    return NextResponse.json(space, { status: 201 });
  } catch (error) {
    console.error('Error al crear espacio:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

