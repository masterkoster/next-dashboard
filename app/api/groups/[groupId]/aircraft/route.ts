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
    
    // Get user by email using raw SQL
    const users = await prisma.$queryRawUnsafe(`
      SELECT id FROM [User] WHERE email = '${session.user.email}'
    `) as any[];
    
    if (!users || users.length === 0) {
      return NextResponse.json({ error: '[User] not found' }, { status: 404 });
    }
    
    const userId = users[0].id;
    
    // Check membership using raw SQL
    const memberships = await prisma.$queryRawUnsafe(`
      SELECT * FROM GroupMember WHERE groupId = '${groupId}' AND userId = '${userId}'
    `) as any[];

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 });
    }

    const aircraft = await prisma.$queryRawUnsafe(`
      SELECT * FROM ClubAircraft WHERE groupId = '${groupId}' ORDER BY createdAt DESC
    `) as any[];

    const formattedAircraft = (aircraft || []).map((a: any) => ({
      id: a.id,
      groupId: a.groupId,
      nNumber: a.nNumber,
      nickname: a.nickname,
      customName: a.customName,
      make: a.make,
      model: a.model,
      year: a.year,
      totalTachHours: a.totalTachHours ? Number(a.totalTachHours) : null,
      totalHobbsHours: a.totalHobbsHours ? Number(a.totalHobbsHours) : null,
      registrationType: a.registrationType,
      hasInsurance: a.hasInsurance,
      maxPassengers: a.maxPassengers,
      hourlyRate: a.hourlyRate ? Number(a.hourlyRate) : null,
      aircraftNotes: a.aircraftNotes,
      status: a.status,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }));

    return NextResponse.json(formattedAircraft);
  } catch (error) {
    console.error('Error fetching aircraft:', error);
    return NextResponse.json({ error: 'Failed to fetch aircraft', details: String(error) }, { status: 500 });
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
    
    // Get user by email using raw SQL
    const users = await prisma.$queryRawUnsafe(`
      SELECT id FROM [User] WHERE email = '${session.user.email}'
    `) as any[];
    
    if (!users || users.length === 0) {
      return NextResponse.json({ error: '[User] not found' }, { status: 404 });
    }
    
    const userId = users[0].id;

    // Check admin role using raw SQL
    const memberships = await prisma.$queryRawUnsafe(`
      SELECT * FROM GroupMember WHERE groupId = '${groupId}' AND userId = '${userId}' AND role = 'ADMIN'
    `) as any[];

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ error: 'Only admins can add aircraft' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      nNumber, nickname, customName, make, model, year, 
      totalTachHours, totalHobbsHours, registrationType, 
      hasInsurance, maxPassengers, hourlyRate, notes 
    } = body;

    const aircraftId = crypto.randomUUID();
    
    await prisma.$executeRawUnsafe(`
      INSERT INTO ClubAircraft (id, groupId, nNumber, nickname, customName, make, model, year, totalTachHours, totalHobbsHours, registrationType, hasInsurance, maxPassengers, hourlyRate, aircraftNotes, status, createdAt, updatedAt)
      VALUES (
        '${aircraftId}', 
        '${groupId}', 
        ${nNumber ? "'" + nNumber.replace(/'/g, "''") + "'" : 'NULL'}, 
        ${nickname ? "'" + nickname.replace(/'/g, "''") + "'" : 'NULL'}, 
        ${customName ? "'" + customName.replace(/'/g, "''") + "'" : 'NULL'}, 
        ${make ? "'" + make.replace(/'/g, "''") + "'" : 'NULL'}, 
        ${model ? "'" + model.replace(/'/g, "''") + "'" : 'NULL'}, 
        ${year ? parseInt(year) : 'NULL'}, 
        ${totalTachHours ? parseFloat(totalTachHours) : 'NULL'}, 
        ${totalHobbsHours ? parseFloat(totalHobbsHours) : 'NULL'}, 
        ${registrationType ? "'" + registrationType.replace(/'/g, "''") + "'" : 'NULL'}, 
        ${hasInsurance ? 1 : 0}, 
        ${maxPassengers ? parseInt(maxPassengers) : 'NULL'}, 
        ${hourlyRate ? parseFloat(hourlyRate) : 'NULL'}, 
        ${notes ? "'" + notes.replace(/'/g, "''") + "'" : 'NULL'}, 
        'Available',
        GETDATE(),
        GETDATE()
      )
    `);

    // Fetch created aircraft
    const aircraft = await prisma.$queryRawUnsafe(`
      SELECT * FROM ClubAircraft WHERE id = '${aircraftId}'
    `) as any[];

    const a = aircraft[0];
    return NextResponse.json({
      id: a.id,
      groupId: a.groupId,
      nNumber: a.nNumber,
      nickname: a.nickname,
      customName: a.customName,
      make: a.make,
      model: a.model,
      year: a.year,
      totalTachHours: a.totalTachHours ? Number(a.totalTachHours) : null,
      totalHobbsHours: a.totalHobbsHours ? Number(a.totalHobbsHours) : null,
      registrationType: a.registrationType,
      hasInsurance: a.hasInsurance,
      maxPassengers: a.maxPassengers,
      hourlyRate: a.hourlyRate ? Number(a.hourlyRate) : null,
      aircraftNotes: a.aircraftNotes,
      status: a.status,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    });
  } catch (error) {
    console.error('Error adding aircraft:', error);
    return NextResponse.json({ error: 'Failed to add aircraft', details: String(error) }, { status: 500 });
  }
}
