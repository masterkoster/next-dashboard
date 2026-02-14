import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check admin role in any group
    const adminMembership = await prisma.groupMember.findFirst({
      where: { userId: user.id, role: 'ADMIN' },
    });

    if (!adminMembership) {
      return NextResponse.json({ error: 'Only admins can view billing' }, { status: 403 });
    }

    const url = new URL(request.url);
    const month = parseInt(url.searchParams.get('month') || new Date().getMonth().toString());
    const year = parseInt(url.searchParams.get('year') || new Date().getFullYear().toString());

    // Get start and end of month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    // Get all groups where user is admin
    const adminGroups = await prisma.groupMember.findMany({
      where: { userId: user.id, role: 'ADMIN' },
      include: {
        group: {
          include: {
            aircraft: true,
            members: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
    });

    const groupIds = adminGroups.map(m => m.group.id);

    if (groupIds.length === 0) {
      return NextResponse.json([]);
    }

    // Get flight logs for the month
    const flightLogs = await prisma.flightLog.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        aircraft: { groupId: { in: groupIds } },
      },
      include: {
        aircraft: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Calculate billing per member
    const billingByMember: Record<string, {
      userId: string;
      name: string;
      email: string;
      flights: number;
      totalHobbs: number;
      totalTach: number;
      totalCost: number;
      details: {
        date: Date;
        aircraft: string;
        hobbs: number;
        tach: number;
        cost: number;
      }[];
    }> = {};

    for (const log of flightLogs) {
      const userId = log.userId;
      const userName = log.user?.name || log.user?.email || 'Unknown';
      const userEmail = log.user?.email || '';
      
      // Use existing hobbsTime or calculate from start/end
      const hobbsUsed = log.hobbsTime ? Number(log.hobbsTime) : 0;
      const tachUsed = log.tachTime || 0;
      
      // Calculate cost based on aircraft hourly rate
      const hourlyRate = log.aircraft?.hourlyRate ? Number(log.aircraft.hourlyRate) : 0;
      const cost = hobbsUsed * hourlyRate;

      if (!billingByMember[userId]) {
        billingByMember[userId] = {
          userId,
          name: userName,
          email: userEmail,
          flights: 0,
          totalHobbs: 0,
          totalTach: 0,
          totalCost: 0,
          details: [],
        };
      }

      billingByMember[userId].flights++;
      billingByMember[userId].totalHobbs += hobbsUsed;
      billingByMember[userId].totalTach += Number(tachUsed);
      billingByMember[userId].totalCost += cost;
      billingByMember[userId].details.push({
        date: log.date,
        aircraft: log.aircraft?.nNumber || log.aircraft?.customName || 'Unknown',
        hobbs: hobbsUsed,
        tach: Number(tachUsed),
        cost,
      });
    }

    const result = Object.values(billingByMember).map(m => ({
      ...m,
      totalCost: Math.round(m.totalCost * 100) / 100,
    }));

    // Sort by total cost descending
    result.sort((a, b) => b.totalCost - a.totalCost);

    return NextResponse.json({
      month: MONTHS[month],
      year,
      totalMembers: result.length,
      totalFlights: result.reduce((sum, m) => sum + m.flights, 0),
      totalHobbs: result.reduce((sum, m) => sum + m.totalHobbs, 0),
      totalCost: result.reduce((sum, m) => sum + m.totalCost, 0),
      members: result,
    });
  } catch (error) {
    console.error('Error fetching billing:', error);
    return NextResponse.json({ error: 'Failed to fetch billing', details: String(error) }, { status: 500 });
  }
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
