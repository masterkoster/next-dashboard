import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const status = searchParams.get('status'); // 'PENDING', 'APPROVED', 'DENIED'

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID required' }, { status: 400 });
    }

    // Check admin access
    const membership = await prisma.groupMember.findFirst({
      where: {
        userId: session.user.id,
        groupId,
        role: { in: ['ADMIN', 'OWNER'] }
      }
    });

    if (!membership) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all aircraft IDs for this group
    const aircraftList = await prisma.clubAircraft.findMany({
      where: { groupId },
      select: { id: true, nNumber: true }
    });

    const aircraftIds = aircraftList.map(a => a.id);

    // Fetch fuel expenses
    const whereClause: any = {
      aircraftId: { in: aircraftIds }
    };

    if (status) {
      whereClause.status = status;
    }

    const expenses = await prisma.fuelExpense.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Enrich with pilot and aircraft info
    const enrichedExpenses = await Promise.all(expenses.map(async (expense) => {
      const pilot = await prisma.user.findUnique({
        where: { id: expense.userId },
        select: { name: true, email: true }
      });

      const aircraft = aircraftList.find(a => a.id === expense.aircraftId);

      return {
        id: expense.id,
        pilot: pilot?.name || 'Unknown',
        pilotEmail: pilot?.email || '',
        aircraft: aircraft?.nNumber || 'N/A',
        date: expense.createdAt?.toISOString().split('T')[0] || 'N/A',
        gallons: expense.gallons.toNumber(),
        pricePerGal: expense.pricePerGallon.toNumber(),
        total: expense.totalCost.toNumber(),
        status: expense.status,
        submittedAt: expense.createdAt?.toLocaleString() || 'N/A',
        approvedAt: expense.approvedAt?.toISOString() || null,
        approvedBy: expense.approvedBy,
        receiptUrl: expense.receiptUrl,
        notes: expense.notes,
      };
    }));

    // Calculate stats
    const pending = enrichedExpenses.filter(e => e.status === 'PENDING');
    const approved = enrichedExpenses.filter(e => e.status === 'APPROVED');
    const denied = enrichedExpenses.filter(e => e.status === 'DENIED');

    const pendingTotal = pending.reduce((sum, e) => sum + e.total, 0);
    const approvedTotal = approved.reduce((sum, e) => sum + e.total, 0);

    return NextResponse.json({
      expenses: enrichedExpenses,
      stats: {
        pendingCount: pending.length,
        pendingTotal,
        approvedCount: approved.length,
        approvedTotal,
        deniedCount: denied.length
      }
    });
  } catch (error) {
    console.error('Error fetching fuel expenses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
