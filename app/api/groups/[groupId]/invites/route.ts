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
      include: {
        group: { select: { id: true, name: true } }
      },
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
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check admin role
    const membership = await prisma.groupMember.findFirst({
      where: { groupId, userId: user.id, role: 'ADMIN' },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Only admins can create invites' }, { status: 403 });
    }

    const body = await request.json();
    const { email, role, expiresInDays } = body;

    // Check if invite already exists for this email+group (and not expired)
    if (email) {
      const existingInvite = await prisma.invite.findFirst({
        where: { 
          groupId,
          email: email.toLowerCase(),
          expiresAt: { gt: new Date() },
        },
      });

      if (existingInvite) {
        return NextResponse.json({ error: 'An invitation has already been sent to this email' }, { status: 400 });
      }

      // Also check if user is already a member
      const existingMember = await prisma.groupMember.findFirst({
        where: { 
          groupId,
          user: { email: email.toLowerCase() },
        },
      });

      if (existingMember) {
        return NextResponse.json({ error: 'This user is already a member of the group' }, { status: 400 });
      }
    }

    // Get group's default expiry setting
    const group = await prisma.flyingGroup.findUnique({
      where: { id: groupId },
      select: { defaultInviteExpiry: true }
    });
    
    // Determine expiry: use provided value, or group's default, or 7 days
    let expiresAt: Date | null = null;
    if (expiresInDays !== -1) { // -1 means never
      const days = expiresInDays ?? group?.defaultInviteExpiry ?? 7;
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);
    }

    // Generate unique token
    const token = randomBytes(32).toString('hex');

    const invite = await prisma.invite.create({
      data: {
        groupId,
        token,
        email: email ? email.toLowerCase() : null,
        role: role || 'VIEWER',
        createdBy: user.id,
        expiresAt: expiresAt || new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10), // 10 years if null
      },
    });

    return NextResponse.json({ 
      token, 
      expiresAt: expiresAt,
      expiresNever: expiresInDays === -1 
    });
  } catch (error) {
    console.error('Error creating invite:', error);
    return NextResponse.json({ error: 'Failed to create invite: ' + String(error) }, { status: 500 });
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
