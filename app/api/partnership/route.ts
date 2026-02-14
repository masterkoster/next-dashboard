import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET all active partnership profiles
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const airport = url.searchParams.get('airport');
    const state = url.searchParams.get('state');
    const experience = url.searchParams.get('experience');

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { PartnershipProfile: true }
    });

    const where: any = { isActive: true };

    if (airport) {
      where.homeAirport = { contains: airport.toUpperCase() };
    }

    if (state) {
      where.state = { contains: state.toUpperCase() };
    }

    if (experience) {
      where.experienceLevel = { contains: experience };
    }

    // Exclude current user's profile
    if (currentUser?.PartnershipProfile) {
      where.userId = { not: currentUser.PartnershipProfile.userId };
    }

    const profiles = await prisma.partnershipProfile.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(profiles);
  } catch (error) {
    console.error('Error fetching partnerships:', error);
    return NextResponse.json({ error: 'Failed to fetch partnerships', details: String(error) }, { status: 500 });
  }
}

// POST create or update user's partnership profile
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      availability,
      flightInterests,
      homeAirport,
      experienceLevel,
      bio,
      lookingFor,
      isActive,
      city,
      state
    } = body;

    // Geocode city/state to lat/long (free Nominatim API)
    let latitude = null;
    let longitude = null;

    if (city && state) {
      try {
        const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)},${encodeURIComponent(state)},USA&limit=1`;
        const geoRes = await fetch(geoUrl, {
          headers: { 'User-Agent': 'AviationDashboard/1.0' }
        });
        const geoData = await geoRes.json();
        if (geoData && geoData.length > 0) {
          latitude = parseFloat(geoData[0].lat);
          longitude = parseFloat(geoData[0].lon);
        }
      } catch (geoError) {
        console.error('Geocoding error:', geoError);
        // Continue without coordinates
      }
    }

    // Upsert the profile
    const profile = await prisma.partnershipProfile.upsert({
      where: { userId: user.id },
      update: {
        availability,
        flightInterests,
        homeAirport: homeAirport?.toUpperCase(),
        experienceLevel,
        bio,
        lookingFor,
        isActive: isActive ?? true,
        city,
        state: state?.toUpperCase(),
        latitude,
        longitude
      },
      create: {
        userId: user.id,
        availability,
        flightInterests,
        homeAirport: homeAirport?.toUpperCase(),
        experienceLevel,
        bio,
        lookingFor,
        isActive: isActive ?? true,
        city,
        state: state?.toUpperCase(),
        latitude,
        longitude
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error saving partnership profile:', error);
    return NextResponse.json({ error: 'Failed to save profile', details: String(error) }, { status: 500 });
  }
}
