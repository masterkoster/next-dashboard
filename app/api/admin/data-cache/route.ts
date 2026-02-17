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

    // Get stats from SQL Server database
    // Note: Some stats may not be available - we'll return what's available
    
    // Get total users
    const userCountResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as total FROM [User]
    `) as any[];
    const userCount = Number(userCountResult[0]?.total || 0);

    // Get total flight plans
    const fpCountResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as total FROM [FlightPlan]
    `) as any[];
    const fpCount = Number(fpCountResult[0]?.total || 0);

    // Get total groups
    const groupCountResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as total FROM [FlyingGroup]
    `) as any[];
    const groupCount = Number(groupCountResult[0]?.total || 0);

    // Get total aircraft in clubs
    const aircraftCountResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as total FROM [ClubAircraft]
    `) as any[];
    const aircraftCount = Number(aircraftCountResult[0]?.total || 0);

    // Get error reports count
    const errorCountResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as total FROM [ErrorReport] WHERE status = 'open'
    `) as any[];
    const openErrors = Number(errorCountResult[0]?.total || 0);

    const results = {
      users: {
        name: 'Users',
        description: 'Registered users on the platform',
        cachedCount: userCount,
        lastUpdated: null,
        source: 'User database'
      },
      flightPlans: {
        name: 'Flight Plans',
        description: 'Saved flight plans by users',
        cachedCount: fpCount,
        lastUpdated: null,
        source: 'User data'
      },
      clubs: {
        name: 'Flying Clubs',
        description: 'Active flying clubs',
        cachedCount: groupCount,
        lastUpdated: null,
        source: 'Club database'
      },
      clubAircraft: {
        name: 'Club Aircraft',
        description: 'Aircraft in flying clubs',
        cachedCount: aircraftCount,
        lastUpdated: null,
        source: 'Club fleet data'
      },
      openErrors: {
        name: 'Open Error Reports',
        description: 'User-submitted bug reports',
        cachedCount: openErrors,
        lastUpdated: null,
        source: 'Error tracking'
      }
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching data status:', error);
    return NextResponse.json({ error: 'Failed to fetch data status: ' + String(error) }, { status: 500 });
  }
}
