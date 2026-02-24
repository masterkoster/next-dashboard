import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ groupId: string }>;
}

// GET /api/clubs/[groupId]/blockouts - List blockouts
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;

    // Verify admin membership
    const user = await prisma.$queryRawUnsafe(`
      SELECT id FROM [User] WHERE email = '${session.user.email}'
    `) as any[];

    if (!user || user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = user[0].id;

    const memberships = await prisma.$queryRawUnsafe(`
      SELECT role FROM GroupMember WHERE groupId = '${groupId}' AND userId = '${userId}'
    `) as any[];

    if (!memberships || memberships.length === 0 || memberships[0].role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const blockouts = await prisma.$queryRawUnsafe(`
      SELECT 
        bo.*,
        a.nNumber, a.customName
      FROM BlockOut bo
      LEFT JOIN ClubAircraft a ON bo.aircraftId = a.id
      WHERE bo.groupId = '${groupId}'
      ORDER BY bo.startTime ASC
    `) as any[];

    return NextResponse.json(blockouts);
  } catch (error) {
    console.error('Error fetching blockouts:', error);
    return NextResponse.json({ error: 'Failed to fetch blockouts' }, { status: 500 });
  }
}

// POST /api/clubs/[groupId]/blockouts - Create blockout
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;

    // Verify admin membership
    const user = await prisma.$queryRawUnsafe(`
      SELECT id FROM [User] WHERE email = '${session.user.email}'
    `) as any[];

    if (!user || user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = user[0].id;

    const memberships = await prisma.$queryRawUnsafe(`
      SELECT role FROM GroupMember WHERE groupId = '${groupId}' AND userId = '${userId}'
    `) as any[];

    if (!memberships || memberships.length === 0 || memberships[0].role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { aircraftId, title, startTime, endTime } = body;

    if (!title || !startTime || !endTime) {
      return NextResponse.json({ error: 'Title, startTime, and endTime required' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    
    await prisma.$executeRawUnsafe(`
      INSERT INTO BlockOut (id, groupId, aircraftId, title, startTime, endTime, createdAt)
      VALUES (
        '${id}', 
        '${groupId}', 
        ${aircraftId ? "'" + aircraftId + "'" : 'NULL'}, 
        '${title.replace(/'/g, "''")}', 
        '${new Date(startTime).toISOString()}', 
        '${new Date(endTime).toISOString()}', 
        GETDATE()
      )
    `);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error creating blockout:', error);
    return NextResponse.json({ error: 'Failed to create blockout' }, { status: 500 });
  }
}
