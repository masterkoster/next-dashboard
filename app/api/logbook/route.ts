import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/auth';

// GET - Fetch user's logbook entries
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user has Pro+ tier
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tier: true }
    });

    if (user?.tier !== 'proplus') {
      return NextResponse.json({ 
        error: 'Pro+ subscription required',
        code: 'PROPLUS_REQUIRED'
      }, { status: 403 });
    }

    const entries = await prisma.logbookEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching logbook entries:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}

// POST - Create new logbook entry
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user has Pro+ tier
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tier: true, emailVerified: true }
    });

    if (!user?.emailVerified) {
      return NextResponse.json({ 
        error: 'Please verify your email first',
        code: 'EMAIL_NOT_VERIFIED'
      }, { status: 403 });
    }

    if (user?.tier !== 'proplus') {
      return NextResponse.json({ 
        error: 'Pro+ subscription required',
        code: 'PROPLUS_REQUIRED'
      }, { status: 403 });
    }

    const body = await request.json();
    
    const entry = await prisma.logbookEntry.create({
      data: {
        userId: session.user.id,
        date: new Date(body.date),
        aircraft: body.aircraft,
        routeFrom: body.routeFrom,
        routeTo: body.routeTo,
        totalTime: body.totalTime || 0,
        soloTime: body.soloTime || 0,
        dualGiven: body.dualGiven || 0,
        dualReceived: body.dualReceived || 0,
        nightTime: body.nightTime || 0,
        instrumentTime: body.instrumentTime || 0,
        crossCountryTime: body.crossCountryTime || 0,
        dayLandings: body.dayLandings || 0,
        nightLandings: body.nightLandings || 0,
        remarks: body.remarks,
        instructor: body.instructor,
        flightPlanId: body.flightPlanId,
      },
    });

    return NextResponse.json({ entry, message: 'Entry saved' });
  } catch (error) {
    console.error('Error creating logbook entry:', error);
    return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 });
  }
}

// DELETE - Delete a logbook entry
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Entry ID required' }, { status: 400 });
    }

    await prisma.logbookEntry.deleteMany({
      where: { id, userId: session.user.id },
    });

    return NextResponse.json({ message: 'Entry deleted' });
  } catch (error) {
    console.error('Error deleting logbook entry:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
