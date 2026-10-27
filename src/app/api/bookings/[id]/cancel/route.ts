import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { BookingStatus, Role } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ message: 'Reserva no encontrada' }, { status: 404 });
    }

    // Solo el dueño o un ADMIN puede cancelarla
    const isOwner = booking.userId === session.userId;
    const isAdmin = session.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { message: 'Acceso denegado: no puedes cancelar reservas de otros usuarios' },
        { status: 403 }
      );
    }

    if (booking.status === BookingStatus.CANCELLED) {
      return NextResponse.json(
        { message: 'La reserva ya se encuentra cancelada' },
        { status: 400 }
      );
    }

    // Cancelación hasta 2 horas antes del inicio (aplica a usuarios)
    const now = new Date();
    const twoHoursBeforeStart = new Date(booking.startTime.getTime() - 2 * 60 * 60 * 1000);

    if (!isAdmin && now > twoHoursBeforeStart) {
      return NextResponse.json(
        { message: 'Las reservas solo pueden cancelarse con un mínimo de 2 horas de anticipación' },
        { status: 400 }
      );
    }

    //  Se actualiza el estado a CANCELLED 
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
    });

    return NextResponse.json(
      { message: 'Reserva cancelada exitosamente', booking: updatedBooking },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}