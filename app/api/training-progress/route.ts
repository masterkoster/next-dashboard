import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const progress = await prisma.trainingProgress.findUnique({
      where: { userId: session.user.id },
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
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Check if email is verified
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true, email: true }
  });

  if (!user?.emailVerified) {
    return NextResponse.json({ 
      error: 'Please verify your email before saving progress',
      code: 'EMAIL_NOT_VERIFIED'
    }, { status: 403 });
  }

  try {
    const body = await request.json();

    const progress = await prisma.trainingProgress.upsert({
      where: { userId: session.user.id },
      update: {
        ...body,
        lastUpdated: new Date(),
      },
      create: {
        userId: session.user.id,
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
