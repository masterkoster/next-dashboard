import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/error-reports - List error reports
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any)?.role;
    if (role !== 'admin' && role !== 'owner') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status'); // open, in_progress, resolved, closed
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const [total, reports, statusCounts] = await prisma.$transaction([
      prisma.errorReport.count({ where }),
      prisma.errorReport.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          user: { select: { email: true, name: true } },
        },
      }),
      prisma.errorReport.groupBy({
        by: ['status'],
        _count: { _all: true },
        orderBy: { status: 'asc' },
      }),
    ]);

    return NextResponse.json({
      reports: reports.map((r: any) => ({
        ...r,
        userEmail: r.user?.email || null,
        userName: r.user?.name || null,
        user: undefined,
        createdAt: r.createdAt?.toISOString(),
        updatedAt: r.updatedAt?.toISOString(),
      })),
      statusCounts: statusCounts.reduce((acc: any, s: any) => {
        acc[s.status] = Number(s._count?._all || 0);
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
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any)?.role;
    if (role !== 'admin' && role !== 'owner') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, resolution } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status required' }, { status: 400 });
    }

    await prisma.errorReport.update({
      where: { id },
      data: { status, resolution: resolution || null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating error report:', error);
    return NextResponse.json({ error: 'Failed to update error report' }, { status: 500 });
  }
}
