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

// Demo fuel prices for airports without cached data
const DEMO_FUEL_PRICES: Record<string, number> = {
  'KORD': 9.58, 'KLAX': 10.65, 'KVNY': 8.32, 'KPDK': 8.67,
  'KJFK': 12.50, 'KATL': 9.45, 'KDEN': 8.99, 'KSFO': 11.25,
  'KLAS': 9.50, 'KSEA': 10.80, 'KMIA': 10.25, 'KDFW': 8.75,
  'KPHX': 9.15, 'KIAH': 9.30, 'KBOS': 11.50, 'KMSP': 9.20,
  'KCLT': 8.85, 'KSTL': 8.45, 'KPDX': 10.50, 'KRDU': 9.10,
  'KSMF': 9.95, 'KMCO': 9.80, 'KTPA': 10.10,
  'KMDW': 8.55, 'KDAL': 7.95, 'KSAT': 8.25, 'KOAK': 10.40,
  'KSNA': 9.75, 'KBUR': 8.95, 'KFLL': 10.30, 'KPSP': 9.40,
  'KDTW': 9.25, 'KCLE': 8.95, 'KMKE': 8.75, 'KIND': 8.50,
  'KSDF': 8.45, 'KTUL': 8.15, 'KABQ': 8.85, 'KOMA': 8.30,
};

// Demo landing fees
const DEMO_FEES: Record<string, number> = {
  'KJFK': 45, 'KLAX': 40, 'KSFO': 35, 'KORD': 30,
  'KMIA': 38, 'KATL': 28, 'KDEN': 25, 'KLAS': 22,
  'KDTW': 28, 'KCLE': 25, 'KMKE': 22, 'KIND': 24,
};

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
    
    // Use cached data, or fall back to demo prices
    const fuelPrice = fuelData ? fuelData.price : (DEMO_FUEL_PRICES[icaoUpper] || null);
    const landingFeeAmount = feeData ? feeData.price : (DEMO_FEES[icaoUpper] || null);
    
    // If using demo prices, cache them for future use
    if (!fuelData && fuelPrice) {
      try {
        await db.run(`
          INSERT OR REPLACE INTO airport_cache (icao, data_type, price, source_site, last_updated)
          VALUES (?, 'fuel', ?, 'demo', datetime('now'))
        `, icaoUpper, fuelPrice);
      } catch (e) {
        // Ignore cache errors
      }
    }
    
    if (!feeData && landingFeeAmount) {
      try {
        await db.run(`
          INSERT OR REPLACE INTO airport_cache (icao, data_type, price, source_site, last_updated)
          VALUES (?, 'fee', ?, 'demo', datetime('now'))
        `, icaoUpper, landingFeeAmount);
      } catch (e) {
        // Ignore cache errors
      }
    }
    
    return NextResponse.json({
      ...airport,
      runways,
      frequencies,
      fuel: fuelPrice ? {
        price100ll: fuelPrice,
        source: fuelData ? fuelData.source_site : 'demo',
        lastUpdated: fuelData ? fuelData.last_updated : new Date().toISOString()
      } : null,
      landingFee: landingFeeAmount ? {
        amount: landingFeeAmount,
        source: feeData ? feeData.source_site : 'demo',
        lastUpdated: feeData ? feeData.last_updated : new Date().toISOString()
      } : null
    });
  } catch (error) {
    console.error('Error fetching airport details:', error);
    return NextResponse.json({ error: 'Failed to fetch airport details' }, { status: 500 });
  }
}
