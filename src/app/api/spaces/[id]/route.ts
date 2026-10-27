import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession, hasRole } from '@/lib/auth';
import { Role } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }
    if (!hasRole(session, Role.ADMIN)) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.space.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: 'Espacio no encontrado' }, { status: 404 });
    }

    const updated = await prisma.space.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json(
      { message: 'Espacio desactivado exitosamente', space: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al desactivar espacio:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

