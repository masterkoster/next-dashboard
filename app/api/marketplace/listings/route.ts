import { NextResponse } from 'next/server';
import { auth, prisma } from '@/lib/auth';

const LISTING_TYPES = ['FOR_SALE', 'SHARE_SELL', 'SHARE_WANTED'] as const;

type ListingType = (typeof LISTING_TYPES)[number];

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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const airport = url.searchParams.get('airport');
    const query = url.searchParams.get('q');
    const take = Math.min(Number(url.searchParams.get('take')) || 60, 200);

    const where: any = { status: 'active' };
    if (type && LISTING_TYPES.includes(type as ListingType)) {
      where.type = type;
    }
    if (airport) {
      where.airportIcao = airport.toUpperCase();
    }
    if (query) {
      const search = query.trim();
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { aircraftType: { contains: search, mode: 'insensitive' } },
        { airportCity: { contains: search, mode: 'insensitive' } },
      ];
    }

    const listings = await prisma.marketplaceListing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      select: PUBLIC_LISTING_SELECT,
    });

    return NextResponse.json({
      listings: listings.map(sanitizeListing),
    });
  } catch (error) {
    console.error('Marketplace GET failed', error);
    return NextResponse.json({ error: 'Failed to load listings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!session.user.emailVerified) {
      return NextResponse.json({ error: 'Please verify your email before posting listings' }, { status: 403 });
    }

    const body = await request.json();
    const validation = validateListingPayload(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const data = validation.data;
    const listing = await prisma.marketplaceListing.create({
      data: {
        userId: session.user.id,
        type: data.type,
        title: data.title,
        description: data.description,
        aircraftType: data.aircraftType,
        airportIcao: data.airportIcao,
        airportName: data.airportName,
        airportCity: data.airportCity,
        latitude: data.latitude,
        longitude: data.longitude,
        price: data.price,
        sharePercent: data.sharePercent,
        hours: data.hours,
        contactMethod: data.contactMethod,
        contactValue: data.contactValue,
        images: data.images ? JSON.stringify(data.images) : null,
      },
      select: PUBLIC_LISTING_SELECT,
    });

    return NextResponse.json({ listing: sanitizeListing(listing) });
  } catch (error) {
    console.error('Marketplace POST failed', error);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}

function validateListingPayload(payload: any): { valid: true; data: any } | { valid: false; error: string } {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Invalid payload' };
  }

  const type = typeof payload.type === 'string' ? payload.type.toUpperCase() : '';
  if (!LISTING_TYPES.includes(type as ListingType)) {
    return { valid: false, error: 'Invalid listing type' };
  }

  const title = (payload.title || '').toString().trim();
  if (title.length < 4) {
    return { valid: false, error: 'Title must be at least 4 characters' };
  }

  const aircraftType = (payload.aircraftType || '').toString().trim();
  if (!aircraftType) {
    return { valid: false, error: 'Aircraft type is required' };
  }

  const airportIcao = (payload.airportIcao || '').toString().trim().toUpperCase();
  if (!/^[A-Z0-9]{3,4}$/.test(airportIcao)) {
    return { valid: false, error: 'Airport ICAO must be 3-4 characters' };
  }

  const data = {
    type,
    title,
    description: (payload.description || '').toString().trim().slice(0, 2000),
    aircraftType,
    airportIcao,
    airportName: payload.airportName ? payload.airportName.toString().slice(0, 200) : null,
    airportCity: payload.airportCity ? payload.airportCity.toString().slice(0, 200) : null,
    latitude: typeof payload.latitude === 'number' ? payload.latitude : null,
    longitude: typeof payload.longitude === 'number' ? payload.longitude : null,
    price: normalizeInt(payload.price),
    sharePercent: normalizeInt(payload.sharePercent),
    hours: normalizeInt(payload.hours),
    contactMethod: payload.contactMethod ? payload.contactMethod.toString().slice(0, 50) : 'email',
    contactValue: payload.contactValue ? payload.contactValue.toString().slice(0, 200) : null,
    images: Array.isArray(payload.images) ? payload.images.slice(0, 6) : undefined,
  };

  return { valid: true, data };
}

function normalizeInt(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return Math.round(num);
}
