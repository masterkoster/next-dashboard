import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ groupId: string }>;
}

// GET all flight logs for a group
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check membership
    const membership = await prisma.groupMember.findFirst({
      where: { groupId, userId: user.id },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 });
    }

    // Filter logs by groupId
    const logs = await prisma.flightLog.findMany({
      where: { aircraft: { groupId } },
      include: { aircraft: true, user: true },
      orderBy: { date: 'desc' },
      take: 100,
    });

    // Get maintenance for this group
    const maintenance = await prisma.maintenance.findMany({
      where: { groupId },
      orderBy: { reportedDate: 'desc' },
      take: 20,
      include: { aircraft: true },
    });

    return NextResponse.json({ logs: logs || [], maintenance });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch flight logs', 
      details: String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// POST create a flight log
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    // Check membership and role (MEMBER or ADMIN can log flights)
    const membership = await prisma.groupMember.findFirst({
      where: { 
        groupId, 
        userId: user?.id,
        role: { in: ['MEMBER', 'ADMIN'] },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Only members can log flights' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      aircraftId, 
      date, 
      tachStart, 
      tachEnd,
      hobbsStart, 
      hobbsEnd, 
      notes,
      maintenance 
    } = body;

    // Calculate hours
    const hobbsUsed = (hobbsEnd && hobbsStart) ? (parseFloat(hobbsEnd) - parseFloat(hobbsStart)) : 0;
    const tachUsed = (tachEnd && tachStart) ? (parseFloat(tachEnd) - parseFloat(tachStart)) : 0;
    const billableHours = Math.max(hobbsUsed, tachUsed);

    // Create log
    const flightLog = await prisma.flightLog.create({
      data: {
        aircraftId,
        userId: user!.id,
        date: new Date(date),
        tachTime: tachUsed || null,
        hobbsTime: hobbsUsed || null,
        notes: notes || null,
      },
    });

    // Create maintenance if provided
    if (maintenance && maintenance.description) {
      await prisma.maintenance.create({
        data: {
          aircraftId,
          userId: user!.id,
          groupId: groupId,
          description: maintenance.description,
          notes: maintenance.notes || null,
          status: 'NEEDED',
          reportedDate: new Date(),
        },
      });
    }

    return NextResponse.json(flightLog);
  } catch (error) {
    console.error('Error creating flight log:', error);
    return NextResponse.json({ error: 'Failed to create flight log', details: String(error) }, { status: 500 });
  }
}
