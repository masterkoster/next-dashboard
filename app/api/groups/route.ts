import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, dryRate, wetRate, customRates } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const group = await prisma.flyingGroup.create({
      data: {
        name,
        description,
        ownerId: user.id,
        dryRate: dryRate ? parseFloat(dryRate) : null,
        wetRate: wetRate ? parseFloat(wetRate) : null,
        customRates: customRates ? JSON.stringify(customRates) : null,
      },
    });

    // Add creator as admin member
    await prisma.groupMember.create({
      data: {
        userId: user.id,
        groupId: group.id,
        role: 'ADMIN',
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json({ error: 'Failed to create group', details: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      console.log('No session found');
      return NextResponse.json([]);
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.log('User not found for email:', session.user.email);
      return NextResponse.json([]);
    }

    console.log('Fetching groups for user:', user.id);

    // Use raw SQL - SQL Server doesn't support ? placeholders in $queryRawUnsafe
    // user.id is a UUID from auth, so string interpolation is safe
    const memberships = await prisma.$queryRawUnsafe(`
      SELECT gm.role, fg.id, fg.name, fg.description, fg.ownerId, fg.dryRate, fg.wetRate, fg.customRates, fg.createdAt, fg.updatedAt
      FROM GroupMember gm
      JOIN FlyingGroup fg ON gm.groupId = fg.id
      WHERE gm.userId = '${user.id}'
    `) as any[];

    console.log('Memberships found:', memberships.length);

    // Now fetch aircraft for each group
    const groupIds = memberships.map((m: any) => m.id);
    let aircraftMap: Record<string, any[]> = {};
    
    if (groupIds.length > 0) {
      const aircraftList = await prisma.$queryRawUnsafe(`
        SELECT a.*, fg.name as groupName
        FROM ClubAircraft a
        JOIN FlyingGroup fg ON a.groupId = fg.id
        WHERE a.groupId IN (${groupIds.map((id: string) => "'" + id + "'").join(',')})
      `) as any[];
      
      // Group aircraft by groupId
      aircraftList.forEach((a: any) => {
        if (!aircraftMap[a.groupId]) aircraftMap[a.groupId] = [];
        aircraftMap[a.groupId].push({
          id: a.id,
          nNumber: a.nNumber,
          nickname: a.nickname,
          customName: a.customName,
          make: a.make,
          model: a.model,
          status: a.status,
          hourlyRate: a.hourlyRate ? Number(a.hourlyRate) : null,
        });
      });
    }

    const groups = memberships.map((m: any) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      ownerId: m.ownerId,
      dryRate: m.dryRate ? Number(m.dryRate) : null,
      wetRate: m.wetRate ? Number(m.wetRate) : null,
      customRates: m.customRates,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      role: m.role,
      aircraft: aircraftMap[m.id] || [],
    }));
    
    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    // Return empty array instead of error to allow app to work
    return NextResponse.json([]);
  }
}
