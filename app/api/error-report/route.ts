import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/error-report - Submit an error report (no auth required)
export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    
    const { title, description, stepsToReproduce, url, email } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description required' }, { status: 400 });
    }

    // Get userId if logged in
    let userId = null;
    if (session?.user?.email) {
      const users = await prisma.$queryRawUnsafe(`
        SELECT id FROM [User] WHERE email = '${session.user.email}'
      `) as any[];
      if (users && users.length > 0) {
        userId = users[0].id;
      }
    }

    // Get browser info from headers
    const userAgent = request.headers.get('user-agent') || '';

    // Insert error report
    const id = crypto.randomUUID();
    await prisma.$queryRawUnsafe(`
      INSERT INTO [ErrorReport] (id, userId, email, title, description, stepsToReproduce, url, browser, status, createdAt, updatedAt)
      VALUES (
        '${id}',
        ${userId ? "'" + userId + "'" : 'NULL'},
        ${email ? "'" + email + "'" : 'NULL'},
        '${title.replace(/'/g, "''")}',
        '${description.replace(/'/g, "''")}',
        ${stepsToReproduce ? "'" + stepsToReproduce.replace(/'/g, "''") + "'" : 'NULL'},
        ${url ? "'" + url + "'" : 'NULL'},
        ${userAgent ? "'" + userAgent.substring(0, 100) + "'" : 'NULL'},
        'open',
        GETDATE(),
        GETDATE()
      )
    `);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error submitting error report:', error);
    return NextResponse.json({ error: 'Failed to submit error report' }, { status: 500 });
  }
}
