import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const aircraft = await prisma.userAircraft.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nNumber: true,
        nickname: true,
        notes: true,
      },
    });

    return NextResponse.json({ aircraft });
  } catch (error) {
    console.error('Error fetching user aircraft:', error);
    return NextResponse.json({ error: 'Failed to fetch user aircraft' }, { status: 500 });
  }
}
