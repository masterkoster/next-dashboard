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

    // Get user by email using raw SQL
    const users = await prisma.$queryRawUnsafe(`
      SELECT id FROM [User] WHERE email = '${session.user.email}'
    `) as any[];
    
    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const userId = users[0].id;

    // Try to get partnership profile with raw SQL
    let profiles: any[] = [];
    try {
      let query = `
        SELECT pp.*, u.name as userName, u.email as userEmail
        FROM PartnershipProfile pp
        JOIN [User] u ON pp.userId = u.id
        WHERE pp.isActive = 1
      `;
      
      if (airport) {
        query += ` AND pp.homeAirport LIKE '%${airport.toUpperCase()}%'`;
      }
      if (state) {
        query += ` AND pp.state LIKE '%${state.toUpperCase()}%'`;
      }
      if (experience) {
        query += ` AND pp.experienceLevel LIKE '%${experience}%'`;
      }
      
      // Exclude current user's profile
      query += ` AND pp.userId != '${userId}'`;
      query += ` ORDER BY pp.createdAt DESC`;
      
      profiles = await prisma.$queryRawUnsafe(query) as any[];
    } catch (e) {
      // Partnership table might not exist yet
      console.error('Partnership table error:', e);
      return NextResponse.json([]);
    }

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

    // Get user by email using raw SQL
    const users = await prisma.$queryRawUnsafe(`
      SELECT id FROM [User] WHERE email = '${session.user.email}'
    `) as any[];
    
    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const userId = users[0].id;

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
    let latitude: number | null = null;
    let longitude: number | null = null;

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

    // Check if profile exists using raw SQL
    const existing = await prisma.$queryRawUnsafe(`
      SELECT id FROM PartnershipProfile WHERE userId = '${userId}'
    `) as any[];

    const profileId = existing.length > 0 ? existing[0].id : crypto.randomUUID();
    
    // Helper to safely escape strings for SQL
    const esc = (val: any) => val === null || val === undefined ? 'NULL' : "'" + String(val).replace(/'/g, "''") + "'";
    const escNum = (val: any) => val === null || val === undefined ? 'NULL' : String(val);
    const escJson = (val: any) => val === null || val === undefined ? 'NULL' : "'" + JSON.stringify(val).replace(/'/g, "''") + "'";

    if (existing.length > 0) {
      // Update existing profile
      await prisma.$executeRawUnsafe(`
        UPDATE PartnershipProfile SET
          availability = ${escJson(availability)},
          flightInterests = ${escJson(flightInterests)},
          homeAirport = ${esc(homeAirport?.toUpperCase())},
          experienceLevel = ${esc(experienceLevel)},
          bio = ${esc(bio)},
          lookingFor = ${escJson(lookingFor)},
          isActive = ${isActive !== false ? 1 : 0},
          city = ${esc(city)},
          state = ${esc(state?.toUpperCase())},
          latitude = ${escNum(latitude)},
          longitude = ${escNum(longitude)},
          updatedAt = GETDATE()
        WHERE userId = '${userId}'
      `);
    } else {
      // Insert new profile
      await prisma.$executeRawUnsafe(`
        INSERT INTO PartnershipProfile (id, userId, availability, flightInterests, homeAirport, experienceLevel, bio, lookingFor, isActive, city, state, latitude, longitude, createdAt, updatedAt)
        VALUES (
          '${profileId}',
          '${userId}',
          ${escJson(availability)},
          ${escJson(flightInterests)},
          ${esc(homeAirport?.toUpperCase())},
          ${esc(experienceLevel)},
          ${esc(bio)},
          ${escJson(lookingFor)},
          ${isActive !== false ? 1 : 0},
          ${esc(city)},
          ${esc(state?.toUpperCase())},
          ${escNum(latitude)},
          ${escNum(longitude)},
          GETDATE(),
          GETDATE()
        )
      `);
    }

    // Fetch and return the updated profile
    const profiles = await prisma.$queryRawUnsafe(`
      SELECT pp.*, u.name as userName, u.email as userEmail
      FROM PartnershipProfile pp
      JOIN [User] u ON pp.userId = u.id
      WHERE pp.userId = '${userId}'
    `) as any[];

    return NextResponse.json(profiles[0] || {});
  } catch (error) {
    console.error('Error saving partnership profile:', error);
    return NextResponse.json({ 
      error: 'Failed to save profile', 
      details: String(error),
      hint: 'Make sure PartnershipProfile table exists in the database'
    }, { status: 500 });
  }
}
