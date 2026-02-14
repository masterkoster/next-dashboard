import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ groupId: string }>;
}

// GET all aircraft for a group
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;
    
    // Check membership
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    const membership = await prisma.groupMember.findFirst({
      where: { groupId, userId: user?.id },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 });
    }

    const aircraft = await prisma.clubAircraft.findMany({
      where: { groupId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(aircraft);
  } catch (error) {
    console.error('Error fetching aircraft:', error);
    return NextResponse.json({ error: 'Failed to fetch aircraft' }, { status: 500 });
  }
}

// POST add aircraft to group
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    // Check admin role
    const membership = await prisma.groupMember.findFirst({
      where: { groupId, userId: user?.id, role: 'ADMIN' },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Only admins can add aircraft' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      nNumber, nickname, customName, make, model, year, 
      totalTachHours, totalHobbsHours, registrationType, 
      hasInsurance, maxPassengers, hourlyRate, notes 
    } = body;

    const aircraft = await prisma.clubAircraft.create({
      data: {
        groupId,
        nNumber: nNumber || null,
        nickname: nickname || null,
        customName: customName || null,
        make: make || null,
        model: model || null,
        year: year ? parseInt(year) : null,
        totalTachHours: totalTachHours ? parseFloat(totalTachHours) : null,
        totalHobbsHours: totalHobbsHours ? parseFloat(totalHobbsHours) : null,
        registrationType: registrationType || null,
        hasInsurance: hasInsurance || false,
        maxPassengers: maxPassengers ? parseInt(maxPassengers) : null,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        aircraftNotes: notes || null,
      },
    });

    return NextResponse.json(aircraft);
  } catch (error) {
    console.error('Error adding aircraft:', error);
    return NextResponse.json({ error: 'Failed to add aircraft' }, { status: 500 });
  }
}
