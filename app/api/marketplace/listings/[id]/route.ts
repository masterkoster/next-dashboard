import { NextRequest, NextResponse } from 'next/server';
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
  // Aircraft-specific fields
  nNumber: true,
  make: true,
  model: true,
  year: true,
  totalTime: true,
  engineTime: true,
  propTime: true,
  airframeTime: true,
  annualDue: true,
  registrationType: true,
  airworthiness: true,
  fuelType: true,
  avionics: true,
  features: true,
  upgrades: true,
  sellerType: true,
  isVerified: true,
  verifiedAt: true,
  videoUrl: true,
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
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id },
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
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const listing = await prisma.marketplaceListing.findUnique({ where: { id } });
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to edit this listing' }, { status: 403 });
    }

    const data: Record<string, unknown> = {};
    if (body.title) data.title = body.title.toString().slice(0, 200);
    if (body.description !== undefined) data.description = body.description.toString().slice(0, 2000);
    if (body.price !== undefined) data.price = normalizeInt(body.price);
    if (body.sharePercent !== undefined) data.sharePercent = normalizeInt(body.sharePercent);
    if (body.status) data.status = body.status.toString().toLowerCase() === 'inactive' ? 'inactive' : 'active';
    
    // Aircraft-specific fields
    if (body.nNumber !== undefined) data.nNumber = body.nNumber?.toString().slice(0, 10) || null;
    if (body.make !== undefined) data.make = body.make?.toString().slice(0, 100) || null;
    if (body.model !== undefined) data.model = body.model?.toString().slice(0, 100) || null;
    if (body.year !== undefined) data.year = normalizeInt(body.year);
    if (body.totalTime !== undefined) data.totalTime = normalizeInt(body.totalTime);
    if (body.engineTime !== undefined) data.engineTime = normalizeInt(body.engineTime);
    if (body.propTime !== undefined) data.propTime = normalizeInt(body.propTime);
    if (body.airframeTime !== undefined) data.airframeTime = normalizeInt(body.airframeTime);
    if (body.registrationType !== undefined) data.registrationType = body.registrationType?.toString().slice(0, 50) || null;
    if (body.airworthiness !== undefined) data.airworthiness = body.airworthiness?.toString().slice(0, 50) || null;
    if (body.fuelType !== undefined) data.fuelType = body.fuelType?.toString().slice(0, 20) || null;
    if (body.sellerType !== undefined) data.sellerType = body.sellerType?.toString().slice(0, 20) || null;
    if (body.videoUrl !== undefined) data.videoUrl = body.videoUrl?.toString().slice(0, 500) || null;
    if (body.avionics !== undefined) data.avionics = Array.isArray(body.avionics) ? JSON.stringify(body.avionics.slice(0, 50)) : null;
    if (body.features !== undefined) data.features = Array.isArray(body.features) ? JSON.stringify(body.features.slice(0, 50)) : null;
    if (body.upgrades !== undefined) data.upgrades = Array.isArray(body.upgrades) ? JSON.stringify(body.upgrades.slice(0, 50)) : null;

    const updated = await prisma.marketplaceListing.update({
      where: { id },
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
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await context.params;
    const listing = await prisma.marketplaceListing.findUnique({ where: { id } });
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to delete this listing' }, { status: 403 });
    }

    await prisma.marketplaceListing.delete({ where: { id } });
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
    avionics: listing.avionics ? safeParseJSON(listing.avionics) : [],
    features: listing.features ? safeParseJSON(listing.features) : [],
    upgrades: listing.upgrades ? safeParseJSON(listing.upgrades) : [],
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
