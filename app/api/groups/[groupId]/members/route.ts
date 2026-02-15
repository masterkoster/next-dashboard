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
    
    // Check membership using raw SQL to avoid schema issues
    const memberships = await prisma.$queryRawUnsafe(`
      SELECT * FROM GroupMember WHERE groupId = '${groupId}' AND userId = '${user?.id}'
    `) as any[];

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 });
    }

    // Get members using raw SQL
    const members = await prisma.$queryRawUnsafe(`
      SELECT gm.*, u.name as userName, u.email as userEmail
      FROM GroupMember gm
      JOIN User u ON gm.userId = u.id
      WHERE gm.groupId = '${groupId}'
    `) as any[];

    const formattedMembers = (members || []).map((m: any) => ({
      id: m.id,
      userId: m.userId,
      groupId: m.groupId,
      role: m.role,
      joinedAt: m.joinedAt,
      user: {
        id: m.userId,
        name: m.userName,
        email: m.userEmail
      }
    }));

    return NextResponse.json(formattedMembers);
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Failed to fetch members', details: String(error) }, { status: 500 });
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
