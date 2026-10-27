import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { BookingStatus, Role } from '@prisma/client';

//Obtener reservas 
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }

    const whereClause =
      session.role === Role.ADMIN ? {} : { userId: session.userId };

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        space: {
          select: {
            id: true,
            name: true,
            type: true,
            imageUrl: true,
            pricePerHour: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// Crear reserva 
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { spaceId, startTime: rawStart, endTime: rawEnd } = body;

    if (!spaceId || !rawStart || !rawEnd) {
      return NextResponse.json(
        { message: 'spaceId, startTime y endTime son requeridos' },
        { status: 400 }
      );
    }

    const start = new Date(rawStart);
    const end = new Date(rawEnd);
    const now = new Date();

    // Validar horas completas 
    if (
      start.getMinutes() !== 0 ||
      start.getSeconds() !== 0 ||
      start.getMilliseconds() !== 0 ||
      end.getMinutes() !== 0 ||
      end.getSeconds() !== 0 ||
      end.getMilliseconds() !== 0
    ) {
      return NextResponse.json(
        { message: 'Las reservas deben ser en horas completas (ej. de 10:00 a 12:00)' },
        { status: 400 }
      );
    }

    // Duración entre 1 y 4 horas
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (diffHours < 1 || diffHours > 4) {
      return NextResponse.json(
        { message: 'Una reserva debe durar entre 1 y 4 horas completas' },
        { status: 400 }
      );
    }

    //  Solo entre las 7:00 y las 21:00
    const startHour = start.getHours();
    const endHour = end.getHours();
    if (startHour < 7 || endHour > 21 || (endHour === 21 && end.getMinutes() > 0)) {
      return NextResponse.json(
        { message: 'Las reservas solo están permitidas entre las 07:00 y las 21:00' },
        { status: 400 }
      );
    }

    // No en el pasado ni con más de 30 días de anticipación
    if (start < now) {
      return NextResponse.json(
        { message: 'No se puede reservar en una fecha u hora pasada' },
        { status: 400 }
      );
    }

    const maxAdvanceDate = new Date();
    maxAdvanceDate.setDate(now.getDate() + 30);
    if (start > maxAdvanceDate) {
      return NextResponse.json(
        { message: 'No se puede reservar con más de 30 días de anticipación' },
        { status: 400 }
      );
    }

    // Validar existencia y estado activo del espacio
    const space = await prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) {
      return NextResponse.json({ message: 'El espacio no existe' }, { status: 404 });
    }
    if (!space.isActive) {
      return NextResponse.json(
        { message: 'No se puede reservar un espacio desactivado' },
        { status: 400 }
      );
    }

    //Máximo 3 reservas futuras confirmadas por usuario
    const futureActiveBookingsCount = await prisma.booking.count({
      where: {
        userId: session.userId,
        status: BookingStatus.CONFIRMED,
        startTime: { gt: now },
      },
    });

    if (futureActiveBookingsCount >= 3) {
      return NextResponse.json(
        { message: 'Has alcanzado el límite máximo de 3 reservas futuras confirmadas' },
        { status: 409 }
      );
    }

    // No solapamiento de reservas en el mismo espacio
    const overlappingSpaceBooking = await prisma.booking.findFirst({
      where: {
        spaceId,
        status: BookingStatus.CONFIRMED,
        AND: [
          { startTime: { lt: end } },
          { endTime: { gt: start } },
        ],
      },
    });

    if (overlappingSpaceBooking) {
      return NextResponse.json(
        { message: 'El espacio ya tiene una reserva confirmada en ese intervalo de horario' },
        { status: 409 }
      );
    }

    // El usuario no puede tener reservas solapadas en ningún espacio
    const overlappingUserBooking = await prisma.booking.findFirst({
      where: {
        userId: session.userId,
        status: BookingStatus.CONFIRMED,
        AND: [
          { startTime: { lt: end } },
          { endTime: { gt: start } },
        ],
      },
    });

    if (overlappingUserBooking) {
      return NextResponse.json(
        { message: 'Ya posees otra reserva activa que se cruza con este horario' },
        { status: 409 }
      );
    }

    // Precio total calculado exclusivamente por el servidor
    const calculatedTotalPrice = diffHours * space.pricePerHour;

    const newBooking = await prisma.booking.create({
      data: {
        userId: session.userId,
        spaceId,
        startTime: start,
        endTime: end,
        totalPrice: calculatedTotalPrice,
        status: BookingStatus.CONFIRMED,
      },
      include: {
        space: true,
      },
    });

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error('Error al registrar reserva:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}