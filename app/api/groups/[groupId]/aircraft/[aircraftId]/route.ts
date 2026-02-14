import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ groupId: string; aircraftId: string }>;
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
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
