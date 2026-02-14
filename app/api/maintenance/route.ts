import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if Maintenance table exists by trying a simple query
    try {
      const maintenance = await prisma.$queryRawUnsafe(`
        SELECT TOP 10 * FROM Maintenance
      `);
      return NextResponse.json(maintenance || []);
    } catch (tableError) {
      // Table might not exist
      console.error('Maintenance table error:', tableError);
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Error fetching maintenance:', error);
    return NextResponse.json({ error: 'Failed to fetch maintenance', details: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { aircraftId, description, notes } = body;

    // Verify user has access to this aircraft
    const memberships = await prisma.groupMember.findMany({
      where: { userId: user.id },
      include: {
        group: {
          include: {
            aircraft: { where: { id: aircraftId } },
          },
        },
      },
    });

    const hasAccess = memberships.some(m => m.group.aircraft.length > 0);
    if (!hasAccess) {
      return NextResponse.json({ error: 'No access to this aircraft' }, { status: 403 });
    }

    const maintenance = await prisma.$queryRawUnsafe(`
      INSERT INTO Maintenance (id, aircraftId, userId, description, notes, status, reportedDate, createdAt, updatedAt)
      VALUES (NEWID(), ?, ?, ?, ?, 'NEEDED', GETDATE(), GETDATE(), GETDATE())
    `, aircraftId, user.id, description, notes || null);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating maintenance:', error);
    return NextResponse.json({ error: 'Failed to create maintenance' }, { status: 500 });
  }
}
