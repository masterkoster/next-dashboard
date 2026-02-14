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
    
    // Check membership (VIEWERS can also see logs)
    const membership = await prisma.groupMember.findFirst({
      where: { groupId, userId: user.id },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 });
    }

    // Simple query without complex include
    const logs = await prisma.$queryRawUnsafe(`
      SELECT f.*, a.nNumber, a.nickname, a.customName, u.name as userName, u.email as userEmail
      FROM FlightLog f
      JOIN ClubAircraft a ON f.aircraftId = a.id
      JOIN User u ON f.userId = u.id
      WHERE a.groupId = ?
      ORDER BY f.date DESC
    `, groupId);

    return NextResponse.json(Array.isArray(logs) ? logs : []);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ error: 'Failed to fetch flight logs', details: String(error) }, { status: 500 });
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

    // Verify aircraft belongs to group
    const aircraft = await prisma.clubAircraft.findFirst({
      where: { id: aircraftId, groupId },
      include: { group: true },
    });

    if (!aircraft) {
      return NextResponse.json({ error: 'Aircraft not found in group' }, { status: 404 });
    }

    // Calculate hobbs hours used
    const hobbsUsed = (hobbsEnd && hobbsStart) ? (parseFloat(hobbsEnd) - parseFloat(hobbsStart)) : 0;
    const tachUsed = (tachEnd && tachStart) ? (parseFloat(tachEnd) - parseFloat(tachStart)) : 0;
    
    // Use the greater of hobbs or tach for billing
    const billableHours = Math.max(hobbsUsed, tachUsed);
    
    // Calculate cost based on hourly rate
    let calculatedCost = null;
    if (billableHours > 0 && aircraft.hourlyRate) {
      calculatedCost = billableHours * Number(aircraft.hourlyRate);
    }

    const flightLog = await prisma.flightLog.create({
      data: {
        aircraftId,
        userId: user!.id,
        date: new Date(date),
        tachTime: tachUsed || null,
        hobbsTime: hobbsUsed || null,
        // Skip new columns for now - database may not have them
        notes: notes || null,
      },
      include: {
        aircraft: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Create maintenance item if provided
    if (maintenance && maintenance.description) {
      await prisma.$queryRawUnsafe(`
        INSERT INTO Maintenance (id, aircraftId, userId, description, notes, status, reportedDate, createdAt, updatedAt)
        VALUES (NEWID(), ?, ?, ?, ?, 'NEEDED', GETDATE(), GETDATE(), GETDATE())
      `, aircraftId, user!.id, maintenance.description, maintenance.notes || null);
    }

    return NextResponse.json(flightLog);
  } catch (error) {
    console.error('Error creating flight log:', error);
    return NextResponse.json({ error: 'Failed to create flight log' }, { status: 500 });
  }
}
