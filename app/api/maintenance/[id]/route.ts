import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, cost, notes } = body;

    // Verify user has access to this maintenance (must be member of the aircraft's group)
    const maintenance = await prisma.$queryRawUnsafe(`
      SELECT m.*, a.groupId, g.id as groupId2
      FROM Maintenance m
      JOIN ClubAircraft a ON m.aircraftId = a.id
      JOIN FlyingGroup g ON a.groupId = g.id
      WHERE m.id = ?
    `, id) as any[];

    if (!maintenance || maintenance.length === 0) {
      return NextResponse.json({ error: 'Maintenance not found' }, { status: 404 });
    }

    const groupId = maintenance[0].groupId;

    // Check membership
    const membership = await prisma.groupMember.findFirst({
      where: { userId: user.id, groupId },
    });

    if (!membership) {
      return NextResponse.json({ error: 'No access to this maintenance' }, { status: 403 });
    }

    const resolvedDate = status === 'DONE' ? new Date() : null;

    await prisma.$queryRawUnsafe(`
      UPDATE Maintenance 
      SET status = ?, cost = ?, notes = ?, resolvedDate = ?, updatedAt = GETDATE()
      WHERE id = ?
    `, status, cost || null, notes || null, resolvedDate, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating maintenance:', error);
    return NextResponse.json({ error: 'Failed to update maintenance' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;

    // Only allow delete for NEEDED status and by admin
    const maintenance = await prisma.$queryRawUnsafe(`
      SELECT m.*, a.groupId
      FROM Maintenance m
      JOIN ClubAircraft a ON m.aircraftId = a.id
      WHERE m.id = ?
    `, id) as any[];

    if (!maintenance || maintenance.length === 0) {
      return NextResponse.json({ error: 'Maintenance not found' }, { status: 404 });
    }

    // Check admin role
    const membership = await prisma.groupMember.findFirst({
      where: { userId: user.id, groupId: maintenance[0].groupId, role: 'ADMIN' },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Only admins can delete maintenance' }, { status: 403 });
    }

    await prisma.$queryRawUnsafe(`DELETE FROM Maintenance WHERE id = ?`, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting maintenance:', error);
    return NextResponse.json({ error: 'Failed to delete maintenance' }, { status: 500 });
  }
}
