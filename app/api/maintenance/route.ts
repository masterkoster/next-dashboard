import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all maintenance
    const maintenance = await prisma.maintenance.findMany({
      orderBy: { reportedDate: 'desc' },
      take: 50,
    });

    return NextResponse.json(maintenance || []);
  } catch (error) {
    console.error('Error fetching maintenance:', error);
    return NextResponse.json({ error: 'Failed to fetch maintenance', details: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { aircraftId, description, notes } = body;

    if (!aircraftId || !description) {
      return NextResponse.json({ error: 'Aircraft and description required' }, { status: 400 });
    }

    const maintenance = await prisma.maintenance.create({
      data: {
        aircraftId,
        userId: user.id,
        description,
        notes: notes || null,
        status: 'NEEDED',
        reportedDate: new Date(),
      },
    });

    return NextResponse.json(maintenance);
  } catch (error) {
    console.error('Error creating maintenance:', error);
    return NextResponse.json({ error: 'Failed to create maintenance', details: String(error) }, { status: 500 });
  }
}
