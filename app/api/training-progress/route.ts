import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const progress = await prisma.trainingProgress.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json(progress || {
      totalHours: 0,
      soloHours: 0,
      nightHours: 0,
      instrumentHours: 0,
      crossCountryHours: 0,
      xcSoloHours: 0,
      xcSoloDone: false,
      nightSoloDone: false,
      instrumentDone: false,
      soloDone: false,
      threeTakeoffsLandingsDone: false,
      threeNightTakeoffsLandingsDone: false,
      dualGiven: 0,
      hoodHours: 0,
    });
  } catch (error) {
    console.error('Error fetching training progress:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();

    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const progress = await prisma.trainingProgress.upsert({
      where: { userId: user.id },
      update: {
        ...body,
        lastUpdated: new Date(),
      },
      create: {
        userId: user.id,
        ...body,
        lastUpdated: new Date(),
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error saving training progress:', error);
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
  }
}
