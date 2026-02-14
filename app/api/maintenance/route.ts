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

    // Get all maintenance 
    const maintenance = await prisma.$queryRaw`SELECT * FROM Maintenance ORDER BY reportedDate DESC`;

    console.log('Maintenance fetched:', maintenance);
    return NextResponse.json(maintenance);
  } catch (error) {
    console.error('Error fetching maintenance:', error);
    return NextResponse.json({ error: 'Failed to fetch maintenance', details: String(error), stack: error instanceof Error ? error.stack : undefined }, { status: 500 });
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
    const { aircraftId, description, notes, groupId } = body;

    if (!aircraftId || !description) {
      return NextResponse.json({ error: 'Aircraft and description required' }, { status: 400 });
    }

    await prisma.$executeRaw`
      INSERT INTO Maintenance (id, aircraftId, userId, description, notes, status, reportedDate, createdAt, updatedAt)
      VALUES (NEWID(), ${aircraftId}, ${user.id}, ${description}, ${notes || null}, 'NEEDED', GETDATE(), GETDATE(), GETDATE())
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating maintenance:', error);
    return NextResponse.json({ error: 'Failed to create maintenance', details: String(error) }, { status: 500 });
  }
}
