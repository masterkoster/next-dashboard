import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/marketplace/listings - List marketplace listings for moderation
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const take = parseInt(searchParams.get('take') || '50');

    const where: any = {};
    if (status) where.status = status;

    const listings = await prisma.marketplaceListing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({
      listings: listings.map(l => ({
        id: l.id,
        title: l.title,
        price: l.price || 0,
        status: l.status,
        views: 0,
        listed: l.createdAt?.toISOString() || null,
        flagged: l.status === 'flagged',
        seller: l.user?.name || l.user?.email || 'Unknown',
      }))
    });
  } catch (error) {
    console.error('Error fetching marketplace listings:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}
