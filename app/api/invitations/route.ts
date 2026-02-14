import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET pending invitations for current user
export async function GET() {
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

    // Find pending invites for this user's email
    const invites = await prisma.invite.findMany({
      where: {
        email: user.email,
        expiresAt: { gt: new Date() },
      },
      include: {
        group: {
          select: { id: true, name: true, description: true }
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(invites);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 });
  }
}

// Accept invitation
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Please log in to accept invitation' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { inviteId } = body;

    // Find the invite
    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
      include: { group: true },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (invite.email !== user.email) {
      return NextResponse.json({ error: 'This invitation is not for you' }, { status: 403 });
    }

    if (invite.expiresAt <= new Date()) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 });
    }

    // Check if already a member
    const existingMember = await prisma.groupMember.findFirst({
      where: {
        userId: user.id,
        groupId: invite.groupId,
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: 'You are already a member of this group' }, { status: 400 });
    }

    // Add user as member
    await prisma.groupMember.create({
      data: {
        userId: user.id,
        groupId: invite.groupId,
        role: invite.role,
      },
    });

    // Mark invite as accepted - delete it since it's used
    await prisma.invite.delete({
      where: { id: inviteId },
    });

    return NextResponse.json({ success: true, group: invite.group });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 });
  }
}
