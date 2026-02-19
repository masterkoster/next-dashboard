import { NextResponse } from 'next/server';
import { auth, prisma } from '@/lib/auth';

const PUBLIC_LISTING_SELECT = {
  id: true,
  userId: true,
  type: true,
  title: true,
  description: true,
  aircraftType: true,
  airportIcao: true,
  airportName: true,
  airportCity: true,
  latitude: true,
  longitude: true,
  price: true,
  sharePercent: true,
  hours: true,
  contactMethod: true,
  contactValue: true,
  status: true,
  createdAt: true,
  images: true,
  user: {
    select: {
      id: true,
      name: true,
      username: true,
      tier: true,
    },
  },
} as const;

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: params.id },
      select: PUBLIC_LISTING_SELECT,
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json({ listing: sanitizeListing(listing) });
  } catch (error) {
    console.error('Marketplace GET detail failed', error);
    return NextResponse.json({ error: 'Failed to load listing' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const listing = await prisma.marketplaceListing.findUnique({ where: { id: params.id } });
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to edit this listing' }, { status: 403 });
    }

    const data: any = {};
    if (body.title) data.title = body.title.toString().slice(0, 200);
    if (body.description !== undefined) data.description = body.description.toString().slice(0, 2000);
    if (body.price !== undefined) data.price = normalizeInt(body.price);
    if (body.sharePercent !== undefined) data.sharePercent = normalizeInt(body.sharePercent);
    if (body.status) data.status = body.status.toString().toLowerCase() === 'inactive' ? 'inactive' : 'active';

    const updated = await prisma.marketplaceListing.update({
      where: { id: params.id },
      data,
      select: PUBLIC_LISTING_SELECT,
    });

    return NextResponse.json({ listing: sanitizeListing(updated) });
  } catch (error) {
    console.error('Marketplace PUT failed', error);
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const listing = await prisma.marketplaceListing.findUnique({ where: { id: params.id } });
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to delete this listing' }, { status: 403 });
    }

    await prisma.marketplaceListing.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Marketplace DELETE failed', error);
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
  }
}

function sanitizeListing(listing: any) {
  if (!listing) return listing;
  return {
    ...listing,
    images: listing.images ? safeParseJSON(listing.images) : [],
  };
}

function safeParseJSON(value: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to parse listing images', error);
    return [];
  }
}

function normalizeInt(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return Math.round(num);
}
