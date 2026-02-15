import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { performanceMode: true },
    });

    return NextResponse.json({ performanceMode: user?.performanceMode || 'auto' });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { performanceMode } = body;

    if (!['auto', 'modern', 'legacy'].includes(performanceMode)) {
      return NextResponse.json({ error: 'Invalid performance mode' }, { status: 400 });
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: { performanceMode },
    });

    return NextResponse.json({ success: true, performanceMode });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
