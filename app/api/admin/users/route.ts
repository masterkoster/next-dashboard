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

// GET /api/admin/users - List users with search and pagination
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
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const tier = url.searchParams.get('tier'); // free, pro, or all
    const role = url.searchParams.get('role'); // user, admin, owner
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    
    if (search) {
      whereClause += ` AND (email LIKE '%${search}%' OR name LIKE '%${search}%')`;
    }
    if (tier && tier !== 'all') {
      whereClause += ` AND tier = '${tier}'`;
    }
    if (role) {
      whereClause += ` AND role = '${role}'`;
    }

    // Get total count
    const countResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM [User] WHERE ${whereClause}
    `) as any[];
    const total = Number(countResult[0]?.count || 0);

    // Get users
    const users = await prisma.$queryRawUnsafe(`
      SELECT id, email, name, tier, role, createdAt, updatedAt,
        (SELECT COUNT(*) FROM [FlightPlan] WHERE userId = [User].id) as flightPlanCount,
        (SELECT COUNT(*) FROM [GroupMember] WHERE userId = [User].id) as clubCount
      FROM [User] 
      WHERE ${whereClause}
      ORDER BY createdAt DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
    `) as any[];

    return NextResponse.json({
      users: users.map((u: any) => ({
        ...u,
        flightPlanCount: Number(u.flightPlanCount || 0),
        clubCount: Number(u.clubCount || 0),
        createdAt: u.createdAt?.toISOString(),
        updatedAt: u.updatedAt?.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
