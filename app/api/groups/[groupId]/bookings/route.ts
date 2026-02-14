import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ groupId: string }>;
}

// GET all bookings for a group
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    
    // Check membership (VIEWERS can also see bookings)
    const membership = await prisma.groupMember.findFirst({
      where: { groupId, userId: user?.id },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 });
    }

    const bookings = await prisma.booking.findMany({
      where: { aircraft: { groupId } },
      include: {
        aircraft: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

// POST create a booking
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    // Check membership and role (MEMBER or ADMIN can book)
    const membership = await prisma.groupMember.findFirst({
      where: { 
        groupId, 
        userId: user?.id,
        role: { in: ['MEMBER', 'ADMIN'] },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Only members can book' }, { status: 403 });
    }

    const body = await request.json();
    const { aircraftId, startTime, endTime, purpose } = body;

    // Verify aircraft belongs to group
    const aircraft = await prisma.clubAircraft.findFirst({
      where: { id: aircraftId, groupId },
    });

    if (!aircraft) {
      return NextResponse.json({ error: 'Aircraft not found in group' }, { status: 404 });
    }

    // Check for conflicts
    const conflict = await prisma.booking.findFirst({
      where: {
        aircraftId,
        OR: [
          { startTime: { lt: new Date(endTime) }, endTime: { gt: new Date(startTime) } },
        ],
      },
    });

    if (conflict) {
      return NextResponse.json({ error: 'Time slot conflicts with existing booking' }, { status: 409 });
    }

    const booking = await prisma.booking.create({
      data: {
        aircraftId,
        userId: user!.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        purpose: purpose || null,
      },
      include: {
        aircraft: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
