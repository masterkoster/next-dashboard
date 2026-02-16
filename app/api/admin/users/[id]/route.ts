import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

// Helper to check if user is admin or owner
async function isAdmin(session: any): Promise<boolean> {
  if (!session?.user?.email) return false;
  
  const users = await prisma.$queryRawUnsafe(`
    SELECT role FROM [User] WHERE email = '${session.user.email}'
  `) as any[];
  
  if (!users || users.length === 0) return false;
  return users[0].role === 'admin' || users[0].role === 'owner';
}

// GET /api/admin/users/[id] - Get single user details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdminUser = await isAdmin(session);
    if (!isAdminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;

    // Get user details
    const users = await prisma.$queryRawUnsafe(`
      SELECT id, email, name, tier, role, createdAt, updatedAt, homeState,
        stripeCustomerId, subscriptionEnd
      FROM [User] WHERE id = '${id}'
    `) as any[];

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0];

    // Get flight plans count
    const fpCount = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM [FlightPlan] WHERE userId = '${id}'
    `) as any[];

    // Get clubs (groups) count
    const clubCount = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM [GroupMember] WHERE userId = '${id}'
    `) as any[];

    // Get recent error reports
    const errorReports = await prisma.$queryRawUnsafe(`
      SELECT TOP 5 id, title, status, createdAt 
      FROM [ErrorReport] 
      WHERE userId = '${id}'
      ORDER BY createdAt DESC
    `) as any[];

    return NextResponse.json({
      user: {
        ...user,
        flightPlanCount: Number(fpCount[0]?.count || 0),
        clubCount: Number(clubCount[0]?.count || 0),
        errorReports: errorReports.map((e: any) => ({
          ...e,
          createdAt: e.createdAt?.toISOString(),
        })),
        createdAt: user.createdAt?.toISOString(),
        updatedAt: user.updatedAt?.toISOString(),
        subscriptionEnd: user.subscriptionEnd?.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PUT /api/admin/users/[id] - Update user tier or role
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdminUser = await isAdmin(session);
    if (!isAdminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { tier, role } = body;

    // Build update query
    const updates: string[] = [];
    if (tier) {
      updates.push(`tier = '${tier}'`);
    }
    if (role) {
      updates.push(`role = '${role}'`);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    await prisma.$queryRawUnsafe(`
      UPDATE [User] SET ${updates.join(', ')} WHERE id = '${id}'
    `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// POST /api/admin/users/[id]/reset-password - Reset user's password
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdminUser = await isAdmin(session);
    if (!isAdminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, 12);

    await prisma.$queryRawUnsafe(`
      UPDATE [User] SET password = '${hashedPassword}' WHERE id = '${id}'
    `);

    return NextResponse.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
