import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper to check if user is admin or owner
async function isAdmin(session: any): Promise<boolean> {
  if (!session?.user?.email) return false;
  
  const users = await prisma.$queryRawUnsafe(`
    SELECT role FROM [User] WHERE email = '${session.user.email}'
  `) as any[];
  
  if (!users || users.length === 0) return false;
  return users[0].role === 'admin' || users[0].role === 'owner';
}

// GET /api/admin/error-reports - List error reports
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdminUser = await isAdmin(session);
    if (!isAdminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status'); // open, in_progress, resolved, closed
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    if (status && status !== 'all') {
      whereClause += ` AND status = '${status}'`;
    }

    // Get total count
    const countResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM [ErrorReport] WHERE ${whereClause}
    `) as any[];
    const total = Number(countResult[0]?.count || 0);

    // Get error reports with user info
    const reports = await prisma.$queryRawUnsafe(`
      SELECT er.*, u.email as userEmail, u.name as userName
      FROM [ErrorReport] er
      LEFT JOIN [User] u ON er.userId = u.id
      WHERE ${whereClause}
      ORDER BY er.createdAt DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
    `) as any[];

    // Get counts by status
    const statusCounts = await prisma.$queryRawUnsafe(`
      SELECT status, COUNT(*) as count FROM [ErrorReport] GROUP BY status
    `) as any[];

    return NextResponse.json({
      reports: reports.map((r: any) => ({
        ...r,
        createdAt: r.createdAt?.toISOString(),
        updatedAt: r.updatedAt?.toISOString(),
      })),
      statusCounts: statusCounts.reduce((acc: any, s: any) => {
        acc[s.status] = Number(s.count);
        return acc;
      }, {}),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching error reports:', error);
    return NextResponse.json({ error: 'Failed to fetch error reports' }, { status: 500 });
  }
}

// PUT /api/admin/error-reports - Update error report status
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdminUser = await isAdmin(session);
    if (!isAdminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, resolution } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status required' }, { status: 400 });
    }

    let updateQuery = `status = '${status}'`;
    if (resolution) {
      updateQuery += `, resolution = '${resolution}'`;
    }

    await prisma.$queryRawUnsafe(`
      UPDATE [ErrorReport] SET ${updateQuery} WHERE id = '${id}'
    `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating error report:', error);
    return NextResponse.json({ error: 'Failed to update error report' }, { status: 500 });
  }
}
