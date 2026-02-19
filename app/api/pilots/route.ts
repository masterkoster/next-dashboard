import { NextResponse } from 'next/server';
import { prisma } from '@/lib/auth';

const PUBLIC_PROFILE_SELECT = {
  id: true,
  userId: true,
  homeAirport: true,
  ratings: true,
  availability: true,
  aircraft: true,
  hours: true,
  bio: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      tier: true,
    },
  },
} as const;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const rating = url.searchParams.get('rating');
    const airport = url.searchParams.get('airport');
    const availability = url.searchParams.get('availability');
    const query = url.searchParams.get('q');

    const where: any = {};
    if (airport) {
      where.homeAirport = airport.toUpperCase();
    }
    if (availability) {
      where.availability = availability;
    }
    if (rating) {
      where.ratings = { contains: rating, mode: 'insensitive' };
    }
    if (query) {
      const term = query.trim();
      where.OR = [
        { bio: { contains: term, mode: 'insensitive' } },
        { aircraft: { contains: term, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { name: { contains: term, mode: 'insensitive' } },
              { username: { contains: term, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    const profiles = await prisma.pilotProfile.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 200,
      select: PUBLIC_PROFILE_SELECT,
    });

    return NextResponse.json({
      profiles: profiles.map(serializeProfile),
    });
  } catch (error) {
    console.error('Pilot directory GET failed', error);
    return NextResponse.json({ error: 'Failed to load pilot profiles' }, { status: 500 });
  }
}

function serializeProfile(profile: any) {
  return {
    ...profile,
    ratings: profile.ratings ? safeParseJSON(profile.ratings) : [],
    user: profile.user
      ? {
          id: profile.user.id,
          name: profile.user.name,
          username: profile.user.username,
          email: profile.user.email,
          tier: profile.user.tier,
        }
      : null,
  };
}

function safeParseJSON(value: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to parse profile ratings', error);
    return [];
  }
}
