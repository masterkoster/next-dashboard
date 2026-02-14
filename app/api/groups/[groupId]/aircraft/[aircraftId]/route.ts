import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ groupId: string; aircraftId: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId, aircraftId } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    // Check admin role
    const membership = await prisma.groupMember.findFirst({
      where: { groupId, userId: user?.id, role: 'ADMIN' },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Only admins can update aircraft' }, { status: 403 });
    }

    const body = await request.json();
    const { notes, status } = body;

    const updateData: any = {};
    if (notes !== undefined) updateData.aircraftNotes = notes;
    if (status !== undefined) updateData.status = status;

    const aircraft = await prisma.clubAircraft.update({
      where: { id: aircraftId },
      data: updateData,
    });

    return NextResponse.json(aircraft);
  } catch (error) {
    console.error('Error updating aircraft:', error);
    return NextResponse.json({ error: 'Failed to update aircraft' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId, aircraftId } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    // Check admin role
    const membership = await prisma.groupMember.findFirst({
      where: { groupId, userId: user?.id, role: 'ADMIN' },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Only admins can remove aircraft' }, { status: 403 });
    }

    await prisma.clubAircraft.delete({
      where: { id: aircraftId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing aircraft:', error);
    return NextResponse.json({ error: 'Failed to remove aircraft' }, { status: 500 });
  }
}
