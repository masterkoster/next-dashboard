import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

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

// GET /api/airports/[icao] - Get full airport details
export async function GET(request: Request, { params }: { params: Promise<{ icao: string }> }) {
  try {
    const { icao } = await params;
    const icaoUpper = icao.toUpperCase();
    
    const db = await getDb();
    
    // Get basic airport info
    const airport = await db.get(`
      SELECT icao, iata, name, type, latitude, longitude, elevation_ft, city, state, country
      FROM airports 
      WHERE icao = ?
    `, icaoUpper);
    
    if (!airport) {
      return NextResponse.json({ error: 'Airport not found' }, { status: 404 });
    }
    
    // Get runways
    const runways = await db.all(`
      SELECT length_ft, width_ft, surface, he_ident, le_ident
      FROM runways 
      WHERE icao = ?
      ORDER BY length_ft DESC
      LIMIT 5
    `, icaoUpper);
    
    // Get frequencies
    const frequencies = await db.all(`
      SELECT frequency_mhz, description, type
      FROM frequencies 
      WHERE icao = ?
      ORDER BY 
        CASE type 
          WHEN 'APP' THEN 1 
          WHEN 'TWR' THEN 2 
          WHEN 'GND' THEN 3 
          WHEN 'DEP' THEN 4 
          WHEN 'ATIS' THEN 5 
          WHEN 'CTAF' THEN 6 
          ELSE 7 
        END
      LIMIT 10
    `, icaoUpper);
    
    // Get cached fuel prices
    const fuelCache = await db.all(`
      SELECT data_type, price, source_site, last_updated
      FROM airport_cache 
      WHERE icao = ?
    `, icaoUpper);
    
    const fuelData = fuelCache.find((f: any) => f.data_type === 'fuel');
    const feeData = fuelCache.find((f: any) => f.data_type === 'fee');
    
    return NextResponse.json({
      ...airport,
      runways,
      frequencies,
      fuel: fuelData ? {
        price100ll: fuelData.price,
        source: fuelData.source_site,
        lastUpdated: fuelData.last_updated
      } : null,
      landingFee: feeData ? {
        amount: feeData.price,
        source: feeData.source_site,
        lastUpdated: feeData.last_updated
      } : null
    });
  } catch (error) {
    console.error('Error fetching airport details:', error);
    return NextResponse.json({ error: 'Failed to fetch airport details' }, { status: 500 });
  }
}
