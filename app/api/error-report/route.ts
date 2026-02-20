import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// POST /api/error-report - Submit an error report (no auth required)
export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    
    const { title, description, stepsToReproduce, url, email } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description required' }, { status: 400 });
    }

    const userId = session?.user?.id || null;

    // Get browser info from headers
    const userAgent = request.headers.get('user-agent') || '';

    const id = crypto.randomUUID();
    await prisma.errorReport.create({
      data: {
        id,
        userId,
        email: email ? String(email).slice(0, 255) : null,
        title: String(title).slice(0, 200),
        description: String(description).slice(0, 4000),
        stepsToReproduce: stepsToReproduce ? String(stepsToReproduce).slice(0, 4000) : null,
        url: url ? String(url).slice(0, 500) : null,
        browser: userAgent ? userAgent.slice(0, 100) : null,
        status: 'open',
      },
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error submitting error report:', error);
    return NextResponse.json({ error: 'Failed to submit error report' }, { status: 500 });
  }
}
