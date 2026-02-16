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

// GET /api/admin/stats - Overview statistics
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdminUser = await isAdmin(session);
    if (!isAdminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get total users count
    const totalUsersResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM [User]
    `) as any[];
    const totalUsers = Number(totalUsersResult[0]?.count || 0);

    // Get free vs pro counts
    const tierCounts = await prisma.$queryRawUnsafe(`
      SELECT tier, COUNT(*) as count FROM [User] GROUP BY tier
    `) as any[];
    const freeUsers = tierCounts.find((t: any) => t.tier === 'free')?.count || 0;
    const proUsers = tierCounts.find((t: any) => t.tier === 'pro')?.count || 0;

    // Get users created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsersResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM [User] WHERE createdAt >= '${thirtyDaysAgo.toISOString()}'
    `) as any[];
    const newUsers30Days = Number(newUsersResult[0]?.count || 0);

    // Get open error reports count
    const openErrorsResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM [ErrorReport] WHERE status = 'open'
    `) as any[];
    const openErrorReports = Number(openErrorsResult[0]?.count || 0);

    // Get total flight plans
    const flightPlansResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM [FlightPlan]
    `) as any[];
    const totalFlightPlans = Number(flightPlansResult[0]?.count || 0);

    // Get total groups (clubs)
    const groupsResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM [FlyingGroup]
    `) as any[];
    const totalGroups = Number(groupsResult[0]?.count || 0);

    // Estimate revenue (assuming $39.99/year for pro users)
    const estimatedAnnualRevenue = proUsers * 39.99;
    const estimatedMRR = (proUsers * 39.99) / 12;

    return NextResponse.json({
      totalUsers,
      freeUsers,
      proUsers,
      newUsers30Days,
      openErrorReports,
      totalFlightPlans,
      totalGroups,
      estimatedAnnualRevenue: Math.round(estimatedAnnualRevenue * 100) / 100,
      estimatedMRR: Math.round(estimatedMRR * 100) / 100,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
