import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
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

    const body = await request.json();
    const { name, description, dryRate, wetRate, customRates } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const group = await prisma.flyingGroup.create({
      data: {
        name,
        description,
        ownerId: user.id,
        dryRate: dryRate ? parseFloat(dryRate) : null,
        wetRate: wetRate ? parseFloat(wetRate) : null,
        customRates: customRates ? JSON.stringify(customRates) : null,
      },
    });

    // Add creator as admin member
    await prisma.groupMember.create({
      data: {
        userId: user.id,
        groupId: group.id,
        role: 'ADMIN',
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json({ error: 'Failed to create group', details: String(error) }, { status: 500 });
  }
}

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

    const memberships = await prisma.groupMember.findMany({
      where: { userId: user.id },
      include: {
        group: true,
      },
    });

    const groups = memberships.map((m) => m.group);
    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json({ error: 'Failed to fetch groups', details: String(error) }, { status: 500 });
  }
}
