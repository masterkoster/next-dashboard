import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ groupId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    
    const { groupId } = await params;
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    // Find the invite
    const invite = await prisma.invite.findFirst({
      where: {
        token,
        groupId,
        expiresAt: { gt: new Date() },
      },
    });

    if (!invite) {
      // Check if invite exists but expired or wrong group
      const anyInvite = await prisma.invite.findFirst({
        where: { token },
      });
      if (anyInvite) {
        if (anyInvite.expiresAt <= new Date()) {
          return NextResponse.json({ error: 'Invite has expired. Please ask for a new one.' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Invalid invite link for this group' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Invalid invite link' }, { status: 404 });
    }

    // VIEWER role can join without account - just return success
    if (invite.role === 'VIEWER' && !session?.user?.email) {
      // For viewer invites without login, just return success info
      // The user can view public group info
      const group = await prisma.flyingGroup.findUnique({
        where: { id: groupId },
        select: { id: true, name: true, description: true }
      });
      
      return NextResponse.json({ 
        success: true, 
        role: 'VIEWER',
        group,
        message: 'You can view this group as a viewer'
      });
    }

    // For MEMBER/ADMIN roles, require login
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Please log in to join as a member' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already a member
    const existingMember = await prisma.groupMember.findFirst({
      where: {
        userId: user.id,
        groupId,
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: 'Already a member of this group' }, { status: 400 });
    }

    // Add user as member
    await prisma.groupMember.create({
      data: {
        userId: user.id,
        groupId,
        role: invite.role,
      },
    });

    // Delete the used invite
    await prisma.invite.delete({
      where: { id: invite.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error joining group:', error);
    return NextResponse.json({ error: 'Failed to join group' }, { status: 500 });
  }
}
