import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Helper to check if user is admin or owner
async function isAdmin(session: any): Promise<boolean> {
  if (!session?.user?.email) return false;
  
  const users = await prisma.$queryRawUnsafe(`
    SELECT role FROM [User] WHERE email = '${session.user.email}'
  `) as any[];
  
  if (!users || users.length === 0) return false;
  return users[0].role === 'admin' || users[0].role === 'owner';
}

let db: any = null;

async function getDb() {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'aviation_hub.db');
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
  }
  return db;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdminUser = await isAdmin(session);
    if (!isAdminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const database = await getDb();
    const now = new Date();

    // Get fuel cache stats
    const fuelStats = await database.all(`
      SELECT 
        COUNT(*) as total,
        MAX(last_updated) as newest,
        source_site
      FROM airport_cache 
      WHERE data_type = 'fuel'
      GROUP BY source_site
    `);

    // Get airport_fuel stats
    const airportFuelStats = await database.get(`
      SELECT 
        COUNT(*) as total,
        MAX(scraped_at) as newest
      FROM airport_fuel
    `);

    // Get total airports count
    const airportCount = await database.get(`
      SELECT COUNT(*) as total FROM airports
    `);

    // Get aircraft cache stats
    const aircraftStats = await database.get(`
      SELECT 
        COUNT(*) as total,
        MAX(scraped_at) as newest
      FROM aircraft_cache
    `);

    const results = {
      fuel: {
        name: 'Fuel Prices',
        description: 'Airport fuel prices from AirNav',
        cachedCount: airportFuelStats?.total || 0,
        lastUpdated: airportFuelStats?.newest || null,
        source: 'AirNav.com scraping'
      },
      airports: {
        name: 'Airports',
        description: 'Airport database (FAA data)',
        cachedCount: airportCount?.total || 0,
        lastUpdated: null,
        source: 'Static FAA data'
      },
      aircraft: {
        name: 'Aircraft Database',
        description: 'GA aircraft registration data',
        cachedCount: aircraftStats?.total || 0,
        lastUpdated: aircraftStats?.newest || null,
        source: 'FAA registration data'
      }
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching data status:', error);
    return NextResponse.json({ error: 'Failed to fetch data status' }, { status: 500 });
  }
}
