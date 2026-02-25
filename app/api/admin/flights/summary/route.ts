import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/flights/summary - Aggregate active/scheduled/completed counts
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any)?.role;
    if (role !== 'admin' && role !== 'owner') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const now = new Date();

    const [activeFlights, scheduledFlights, completedFlights] = await Promise.all([
      prisma.flightLog.count({ where: { hobbsEnd: null } }),
      prisma.booking.count({ where: { startTime: { gt: now } } }),
      prisma.flightLog.count({ where: { hobbsEnd: { not: null } } }),
    ]);

    return NextResponse.json({
      activeFlights,
      scheduledFlights,
      completedFlights,
    });
  } catch (error) {
    console.error('Error fetching flight summary:', error);
    return NextResponse.json({ error: 'Failed to fetch flight summary' }, { status: 500 });
  }
}
