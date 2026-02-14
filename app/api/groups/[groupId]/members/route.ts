import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ groupId: string }>;
}

// GET members of a group
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    
    // Check membership
    const membership = await prisma.groupMember.findFirst({
      where: { groupId, userId: user?.id },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 });
    }

    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

// PUT update a member's role (admin only)
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    // Check admin role
    const adminMembership = await prisma.groupMember.findFirst({
      where: { groupId, userId: user?.id, role: 'ADMIN' },
    });

    if (!adminMembership) {
      return NextResponse.json({ error: 'Only admins can update members' }, { status: 403 });
    }

    const body = await request.json();
    const { memberId, role } = body;

    const updated = await prisma.groupMember.update({
      where: { id: memberId },
      data: { role },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
}

// DELETE remove a member from group
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    const url = new URL(request.url);
    const memberId = url.searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ error: 'memberId required' }, { status: 400 });
    }

    // Check if the user is either admin or removing themselves
    const adminMembership = await prisma.groupMember.findFirst({
      where: { groupId, userId: user?.id, role: 'ADMIN' },
    });

    // Allow self-removal or admin removal
    const targetMember = await prisma.groupMember.findFirst({
      where: { id: memberId, groupId },
    });

    if (!targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const isSelfRemoval = targetMember.userId === user?.id;
    
    if (!adminMembership && !isSelfRemoval) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await prisma.groupMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}
