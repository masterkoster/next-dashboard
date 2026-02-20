import { NextResponse } from 'next/server';
import { auth, prisma } from '@/lib/auth';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = session.user.id;

    // Try to upsert presence using Prisma
    // This will fail gracefully if the table doesn't exist yet
    try {
      await prisma.userPresence.upsert({
        where: { userId },
        update: {
          isOnline: true,
          lastSeenAt: new Date(),
        },
        create: {
          userId,
          isOnline: true,
          lastSeenAt: new Date(),
        },
      });
    } catch (prismaError: any) {
      // Table might not exist yet - that's ok, we'll create it manually
      console.warn('UserPresence table not ready:', prismaError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Presence heartbeat failed', error);
    return NextResponse.json({ error: 'Failed to update presence' }, { status: 500 });
  }
}
