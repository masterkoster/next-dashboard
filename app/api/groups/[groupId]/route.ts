import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ groupId: string }>;
}

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
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    // Get group details using raw SQL
    const groups = await prisma.$queryRawUnsafe(`
      SELECT * FROM FlyingGroup WHERE id = '${groupId}'
    `) as any[];

    if (!groups || groups.length === 0) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const g = groups[0];

    // Get members
    const members = await prisma.$queryRawUnsafe(`
      SELECT gm.*, u.name as userName, u.email as userEmail
      FROM GroupMember gm
      JOIN [User] u ON gm.userId = u.id
      WHERE gm.groupId = '${groupId}'
    `) as any[];

    // Get aircraft
    const aircraft = await prisma.$queryRawUnsafe(`
      SELECT * FROM ClubAircraft WHERE groupId = '${groupId}'
    `) as any[];

    const formattedGroup = {
      id: g.id,
      name: g.name,
      description: g.description,
      ownerId: g.ownerId,
      dryRate: g.dryRate ? Number(g.dryRate) : null,
      wetRate: g.wetRate ? Number(g.wetRate) : null,
      customRates: g.customRates,
      showBookings: g.showBookings,
      showAircraft: g.showAircraft,
      showFlights: g.showFlights,
      showMaintenance: g.showMaintenance,
      showBilling: g.showBilling,
      showBillingAll: g.showBillingAll,
      showMembers: g.showMembers,
      showPartners: g.showPartners,
      defaultInviteExpiry: g.defaultInviteExpiry,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
      members: (members || []).map((m: any) => ({
        id: m.id,
        userId: m.userId,
        groupId: m.groupId,
        role: m.role,
        joinedAt: m.joinedAt,
        user: {
          id: m.userId,
          name: m.userName,
          email: m.userEmail,
        },
      })),
      aircraft: (aircraft || []).map((a: any) => ({
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
      })),
    };

    return NextResponse.json(formattedGroup);
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json({ error: 'Failed to fetch group', details: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
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
      return NextResponse.json({ error: 'Only admins can update the group' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      name, description, dryRate, wetRate, customRates,
      showBookings, showAircraft, showFlights, showMaintenance, 
      showBilling, showBillingAll, showMembers, showPartners,
      defaultInviteExpiry
    } = body;

    // Build update query
    const updates: string[] = [];
    if (name !== undefined) updates.push(`name = '${name.replace(/'/g, "''")}'`);
    if (description !== undefined) updates.push(`description = ${description ? "'" + description.replace(/'/g, "''") + "'" : 'NULL'}`);
    if (dryRate !== undefined) updates.push(`dryRate = ${dryRate ? parseFloat(dryRate) : 'NULL'}`);
    if (wetRate !== undefined) updates.push(`wetRate = ${wetRate ? parseFloat(wetRate) : 'NULL'}`);
    if (customRates !== undefined) updates.push(`customRates = '${JSON.stringify(customRates).replace(/'/g, "''")}'`);
    if (showBookings !== undefined) updates.push(`showBookings = ${showBookings ? 1 : 0}`);
    if (showAircraft !== undefined) updates.push(`showAircraft = ${showAircraft ? 1 : 0}`);
    if (showFlights !== undefined) updates.push(`showFlights = ${showFlights ? 1 : 0}`);
    if (showMaintenance !== undefined) updates.push(`showMaintenance = ${showMaintenance ? 1 : 0}`);
    if (showBilling !== undefined) updates.push(`showBilling = ${showBilling ? 1 : 0}`);
    if (showBillingAll !== undefined) updates.push(`showBillingAll = ${showBillingAll ? 1 : 0}`);
    if (showMembers !== undefined) updates.push(`showMembers = ${showMembers ? 1 : 0}`);
    if (showPartners !== undefined) updates.push(`showPartners = ${showPartners ? 1 : 0}`);
    if (defaultInviteExpiry !== undefined) updates.push(`defaultInviteExpiry = ${defaultInviteExpiry !== null ? defaultInviteExpiry : 'NULL'}`);

    if (updates.length > 0) {
      updates.push(`updatedAt = GETDATE()`);
      await prisma.$executeRawUnsafe(`
        UPDATE FlyingGroup SET ${updates.join(', ')} WHERE id = '${groupId}'
      `);
    }

    // Fetch updated group
    const groups = await prisma.$queryRawUnsafe(`SELECT * FROM FlyingGroup WHERE id = '${groupId}'`) as any[];
    return NextResponse.json(groups[0]);
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json({ error: 'Failed to update group', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
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
    
    // Check ownership using raw SQL
    const groups = await prisma.$queryRawUnsafe(`
      SELECT * FROM FlyingGroup WHERE id = '${groupId}'
    `) as any[];

    if (!groups || groups.length === 0) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    if (groups[0].ownerId !== userId) {
      return NextResponse.json({ error: 'Only the owner can delete this group' }, { status: 403 });
    }

    await prisma.$executeRawUnsafe(`DELETE FROM FlyingGroup WHERE id = '${groupId}'`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 });
  }
}
