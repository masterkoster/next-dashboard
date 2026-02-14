import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

interface RouteParams {
  params: Promise<{ groupId: string }>;
}

// GET all invites for a group (admin only)
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    
    // Check admin role
    const membership = await prisma.groupMember.findFirst({
      where: { groupId, userId: user?.id, role: 'ADMIN' },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Only admins can view invites' }, { status: 403 });
    }

    const invites = await prisma.invite.findMany({
      where: { groupId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(invites);
  } catch (error) {
    console.error('Error fetching invites:', error);
    return NextResponse.json({ error: 'Failed to fetch invites' }, { status: 500 });
  }
}

// POST create an invite
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    // Check admin role
    try {
      const membership = await prisma.groupMember.findFirst({
        where: { groupId, userId: user?.id, role: 'ADMIN' },
      });

      if (!membership) {
        return NextResponse.json({ error: 'Only admins can create invites' }, { status: 403 });
      }
    } catch (e) {
      console.error('Admin check error:', e);
      return NextResponse.json({ error: 'Failed to verify admin status' }, { status: 500 });
    }

    const body = await request.json();
    const { email, role } = body;

    // Generate unique token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry

    const invite = await prisma.invite.create({
      data: {
        groupId,
        token,
        email: email || null,
        role: role || 'VIEWER',
        createdBy: user!.id,
        expiresAt,
      },
    });

    return NextResponse.json({ token, expiresAt: invite.expiresAt });
  } catch (error) {
    console.error('Error creating invite:', error);
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
  }
}

// DELETE revoke an invite
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const inviteId = url.searchParams.get('inviteId');

    if (!inviteId) {
      return NextResponse.json({ error: 'inviteId required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    
    // Find the invite to check group ownership
    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
      include: { group: true },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    // Check if user is admin of the group
    const membership = await prisma.groupMember.findFirst({
      where: { 
        groupId: invite.groupId, 
        userId: user?.id, 
        role: 'ADMIN' 
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await prisma.invite.delete({
      where: { id: inviteId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invite:', error);
    return NextResponse.json({ error: 'Failed to delete invite' }, { status: 500 });
  }
}
