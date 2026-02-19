import { NextResponse } from 'next/server';
import { auth, prisma } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const profile = await prisma.pilotProfile.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      profile: profile
        ? { ...profile, ratings: profile.ratings ? safeParseJSON(profile.ratings) : [] }
        : null,
    });
  } catch (error) {
    console.error('Pilot profile GET failed', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const payload = validateProfilePayload(body);
    if (!payload.valid) {
      return NextResponse.json({ error: payload.error }, { status: 400 });
    }

    const data = {
      userId: session.user.id,
      homeAirport: payload.data.homeAirport,
      availability: payload.data.availability,
      aircraft: payload.data.aircraft,
      hours: payload.data.hours,
      bio: payload.data.bio,
      ratings: JSON.stringify(payload.data.ratings),
    };

    const profile = await prisma.pilotProfile.upsert({
      where: { userId: session.user.id },
      update: data,
      create: data,
    });

    return NextResponse.json({
      profile: { ...profile, ratings: payload.data.ratings },
    });
  } catch (error) {
    console.error('Pilot profile PUT failed', error);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}

function validateProfilePayload(payload: any): { valid: true; data: any } | { valid: false; error: string } {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Invalid payload' };
  }

  const ratings = Array.isArray(payload.ratings)
    ? payload.ratings.filter((item: any) => typeof item === 'string').slice(0, 10)
    : [];

  const data = {
    homeAirport: payload.homeAirport ? payload.homeAirport.toString().toUpperCase().slice(0, 10) : null,
    availability: payload.availability ? payload.availability.toString().slice(0, 50) : null,
    aircraft: payload.aircraft ? payload.aircraft.toString().slice(0, 2000) : null,
    bio: payload.bio ? payload.bio.toString().slice(0, 2000) : null,
    hours: typeof payload.hours === 'number' ? Math.max(0, Math.round(payload.hours)) : null,
    ratings,
  };

  return { valid: true, data };
}

function safeParseJSON(value: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to parse ratings', error);
    return [];
  }
}
