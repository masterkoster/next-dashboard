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

    const maintenance = await prisma.$queryRaw`
      SELECT m.*, a.nNumber, a.customName, a.nickname, a.make, a.model
      FROM Maintenance m
      LEFT JOIN ClubAircraft a ON m.aircraftId = a.id
      WHERE m.userId = ${user.id}
      ORDER BY m.reportedDate DESC
    `;

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
    const { aircraftId, description, notes, groupId, isGrounded, postToMarketplace, postAnonymously } = body;

    if (!aircraftId || !description) {
      return NextResponse.json({ error: 'Aircraft and description required' }, { status: 400 });
    }

    await prisma.$executeRaw`
      INSERT INTO Maintenance (id, aircraftId, userId, groupId, description, notes, status, isGrounded, reportedDate, createdAt, updatedAt)
      VALUES (NEWID(), ${aircraftId}, ${user.id}, ${groupId || null}, ${description}, ${notes || null}, 'NEEDED', ${isGrounded ? 1 : 0}, GETDATE(), GETDATE(), GETDATE())
    `;

    if (postToMarketplace) {
      const aircraft = await prisma.clubAircraft.findUnique({
        where: { id: aircraftId },
      })

      const isAnonymous = typeof postAnonymously === 'boolean' ? postAnonymously : true
      await prisma.maintenanceRequest.create({
        data: {
          title: description.slice(0, 120),
          description,
          category: 'OTHER',
          urgency: isGrounded ? 'URGENT' : 'NORMAL',
          aircraftType: [aircraft?.make, aircraft?.model].filter(Boolean).join(' ') || null,
          airportIcao: null,
          city: null,
          state: null,
          locationPrivacy: 'CITY',
          source: 'scheduled',
          anonymous: isAnonymous,
          postedByUserId: user.id,
          postedByName: isAnonymous ? null : user.name,
          postedByEmail: isAnonymous ? null : user.email,
        },
      })
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating maintenance:', error);
    return NextResponse.json({ error: 'Failed to create maintenance', details: String(error) }, { status: 500 });
  }
}
