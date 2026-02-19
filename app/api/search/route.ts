import { NextResponse } from 'next/server';
import { auth, prisma } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get('q')?.trim();

  if (!term || term.length < 2) {
    return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
  }

  const session = await auth();

  try {
    const [marketplace, pilots, flightPlans, documents] = await Promise.all([
      searchMarketplace(term),
      searchPilots(term),
      session?.user?.id ? searchFlightPlans(term, session.user.id) : Promise.resolve([]),
      session?.user?.id ? searchDocuments(term, session.user.id) : Promise.resolve([]),
    ]);

    return NextResponse.json({
      marketplace,
      pilots,
      flightPlans,
      documents,
    });
  } catch (error) {
    console.error('Global search failed', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

async function searchMarketplace(term: string) {
  const query = term.toLowerCase();
  const listings = await prisma.marketplaceListing.findMany({
    where: {
      status: 'active',
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
        { aircraftType: { contains: query } },
        { airportCity: { contains: query } },
        { airportIcao: { contains: query } },
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      aircraftType: true,
      airportIcao: true,
      airportCity: true,
      price: true,
      type: true,
      createdAt: true,
    },
    take: 6,
  });

  return listings.map((listing) => ({
    ...listing,
    typeLabel: listing.type,
  }));
}

async function searchPilots(term: string) {
  const query = term.toLowerCase();
  const profiles = await prisma.pilotProfile.findMany({
    where: {
      OR: [
        { bio: { contains: query, mode: 'insensitive' } },
        { aircraft: { contains: query, mode: 'insensitive' } },
        { user: { name: { contains: query, mode: 'insensitive' } } },
        { user: { username: { contains: query, mode: 'insensitive' } } },
      ],
    },
    select: {
      id: true,
      homeAirport: true,
      availability: true,
      ratings: true,
      bio: true,
      user: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
    take: 6,
  });

  return profiles.map((profile) => ({
    ...profile,
    ratings: profile.ratings ? safeParseJSON(profile.ratings) : [],
  }));
}

async function searchFlightPlans(term: string, userId: string) {
  const query = term.toLowerCase();
  const plans = await prisma.flightPlan.findMany({
    where: {
      userId,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { route: { contains: query, mode: 'insensitive' } },
        { departureIcao: { contains: query, mode: 'insensitive' } },
        { arrivalIcao: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      departureIcao: true,
      arrivalIcao: true,
      route: true,
      updatedAt: true,
    },
    take: 5,
  });

  return plans;
}

async function searchDocuments(term: string, userId: string) {
  const query = term.toLowerCase();
  const docs = await prisma.document.findMany({
    where: {
      userId,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { type: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      type: true,
      description: true,
      fileUrl: true,
      createdAt: true,
    },
    take: 5,
  });

  return docs;
}

function safeParseJSON(value: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to parse JSON', error);
    return [];
  }
}
