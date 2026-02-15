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
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check membership
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: user.id,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    const group = await prisma.flyingGroup.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        aircraft: true,
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check admin role
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: user.id,
        role: 'ADMIN',
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Only admins can update the group' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      name, description, dryRate, wetRate, customRates,
      showBookings, showAircraft, showFlights, showMaintenance, 
      showBilling, showBillingAll, showMembers, showPartners,
      defaultInviteExpiry
    } = body;

    const group = await prisma.flyingGroup.update({
      where: { id: groupId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(dryRate !== undefined && { dryRate }),
        ...(wetRate !== undefined && { wetRate }),
        ...(customRates && { customRates: JSON.stringify(customRates) }),
        // Visibility settings
        ...(showBookings !== undefined && { showBookings }),
        ...(showAircraft !== undefined && { showAircraft }),
        ...(showFlights !== undefined && { showFlights }),
        ...(showMaintenance !== undefined && { showMaintenance }),
        ...(showBilling !== undefined && { showBilling }),
        ...(showBillingAll !== undefined && { showBillingAll }),
        ...(showMembers !== undefined && { showMembers }),
        ...(showPartners !== undefined && { showPartners }),
        ...(defaultInviteExpiry !== undefined && { defaultInviteExpiry }),
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json({ error: 'Failed to update group' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only owner can delete
    const group = await prisma.flyingGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    if (group.ownerId !== user.id) {
      return NextResponse.json({ error: 'Only the owner can delete this group' }, { status: 403 });
    }

    await prisma.flyingGroup.delete({
      where: { id: groupId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 });
  }
}
