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
    
    // Check membership using raw SQL
    const memberships = await prisma.$queryRawUnsafe(`
      SELECT * FROM GroupMember WHERE groupId = '${groupId}' AND userId = '${user.id}'
    `) as any[];

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 });
    }

    // Get logs using raw SQL
    const logs = await prisma.$queryRawUnsafe(`
      SELECT 
        fl.*, 
        a.nNumber, a.customName, a.nickname, a.make, a.model, a.groupId as aircraftGroupId,
        u.name as userName, u.email as userEmail
      FROM FlightLog fl
      JOIN ClubAircraft a ON fl.aircraftId = a.id
      JOIN User u ON fl.userId = u.id
      WHERE a.groupId = '${groupId}'
      ORDER BY fl.date DESC
      OFFSET 0 ROWS FETCH NEXT 100 ROWS ONLY
    `) as any[];

    // Get maintenance for this group
    const maintenance = await prisma.$queryRawUnsafe(`
      SELECT m.*, a.nNumber, a.customName, a.nickname
      FROM Maintenance m
      JOIN ClubAircraft a ON m.aircraftId = a.id
      WHERE a.groupId = '${groupId}'
      ORDER BY m.reportedDate DESC
      OFFSET 0 ROWS FETCH NEXT 20 ROWS ONLY
    `) as any[];

    const formattedLogs = (logs || []).map((l: any) => ({
      id: l.id,
      aircraftId: l.aircraftId,
      userId: l.userId,
      date: l.date,
      tachTime: l.tachTime ? Number(l.tachTime) : null,
      hobbsTime: l.hobbsTime ? Number(l.hobbsTime) : null,
      notes: l.notes,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
      aircraft: {
        id: l.aircraftId,
        nNumber: l.nNumber,
        customName: l.customName,
        nickname: l.nickname,
        make: l.make,
        model: l.model,
        groupId: l.aircraftGroupId,
      },
      user: {
        id: l.userId,
        name: l.userName,
        email: l.userEmail,
      },
    }));

    const formattedMaintenance = (maintenance || []).map((m: any) => ({
      id: m.id,
      aircraftId: m.aircraftId,
      userId: m.userId,
      groupId: m.groupId,
      description: m.description,
      notes: m.notes,
      status: m.status,
      cost: m.cost ? Number(m.cost) : null,
      isGrounded: m.isGrounded,
      reportedDate: m.reportedDate,
      resolvedDate: m.resolvedDate,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      aircraft: {
        id: m.aircraftId,
        nNumber: m.nNumber,
        customName: m.customName,
        nickname: m.nickname,
      },
    }));

    return NextResponse.json({ logs: formattedLogs, maintenance: formattedMaintenance });
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
    const memberships = await prisma.$queryRawUnsafe(`
      SELECT * FROM GroupMember WHERE groupId = '${groupId}' AND userId = '${user?.id}' AND role IN ('MEMBER', 'ADMIN')
    `) as any[];

    if (!memberships || memberships.length === 0) {
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

    // Create log using raw SQL
    const logId = crypto.randomUUID();
    const dateStr = new Date(date).toISOString();
    
    await prisma.$executeRawUnsafe(`
      INSERT INTO FlightLog (id, aircraftId, userId, date, tachTime, hobbsTime, notes, createdAt, updatedAt)
      VALUES ('${logId}', '${aircraftId}', '${user!.id}', '${dateStr}', ${tachUsed || 'NULL'}, ${hobbsUsed || 'NULL'}, ${notes ? "'" + notes.replace(/'/g, "''") + "'" : 'NULL'}, GETDATE(), GETDATE())
    `);

    // Create maintenance if provided
    if (maintenance && maintenance.description) {
      const maintId = crypto.randomUUID();
      await prisma.$executeRawUnsafe(`
        INSERT INTO Maintenance (id, aircraftId, userId, groupId, description, notes, status, isGrounded, reportedDate, createdAt, updatedAt)
        VALUES ('${maintId}', '${aircraftId}', '${user!.id}', '${groupId}', '${maintenance.description.replace(/'/g, "''")}', ${maintenance.notes ? "'" + maintenance.notes.replace(/'/g, "''") + "'" : 'NULL'}, 'NEEDED', 0, GETDATE(), GETDATE(), GETDATE())
      `);
    }

    // Fetch created log
    const logs = await prisma.$queryRawUnsafe(`
      SELECT fl.*, a.nNumber, a.customName, a.nickname
      FROM FlightLog fl
      JOIN ClubAircraft a ON fl.aircraftId = a.id
      WHERE fl.id = '${logId}'
    `) as any[];

    const l = logs[0];
    return NextResponse.json({
      id: l.id,
      aircraftId: l.aircraftId,
      userId: l.userId,
      date: l.date,
      tachTime: l.tachTime ? Number(l.tachTime) : null,
      hobbsTime: l.hobbsTime ? Number(l.hobbsTime) : null,
      notes: l.notes,
      createdAt: l.createdAt,
      aircraft: {
        id: l.aircraftId,
        nNumber: l.nNumber,
        customName: l.customName,
        nickname: l.nickname,
      },
    });
  } catch (error) {
    console.error('Error creating flight log:', error);
    return NextResponse.json({ error: 'Failed to create flight log', details: String(error) }, { status: 500 });
  }
}
