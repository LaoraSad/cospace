import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true },
    });

    return NextResponse.json(
      {
        user: {
          ...session,
          name: dbUser?.name || session.email.split('@')[0],
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        user: {
          ...session,
          name: session.email.split('@')[0],
        },
      },
      { status: 200 }
    );
  }
}

