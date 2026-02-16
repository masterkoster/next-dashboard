/**
 * Data Status Page - Shows what's cached and how old the data is
 */

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

export async function GET() {
  try {
    const database = await getDb();
    
    // Get fuel cache stats
    const fuelStats = await database.get(`
      SELECT 
        COUNT(*) as total,
        MIN(last_updated) as oldest,
        MAX(last_updated) as newest,
        source_site
      FROM airport_cache 
      WHERE data_type = 'fuel'
      GROUP BY source_site
    `);
    
    // Get all cached fuel prices with age
    const fuelPrices = await database.all(`
      SELECT 
        icao,
        price,
        last_updated,
        source_site
      FROM airport_cache 
      WHERE data_type = 'fuel'
      ORDER BY last_updated DESC
    `);
    
    // Get airports by type that have fuel data
    const airportsWithFuel = await database.all(`
      SELECT a.type, COUNT(*) as count
      FROM airports a
      INNER JOIN airport_cache c ON a.icao = c.icao
      WHERE c.data_type = 'fuel'
      GROUP BY a.type
    `);
    
    // Calculate ages
    const now = new Date();
    const pricesWithAge = fuelPrices.map((p: any) => {
      const cached = new Date(p.last_updated);
      const hoursAgo = Math.floor((now.getTime() - cached.getTime()) / (1000 * 60 * 60));
      const daysAgo = Math.floor(hoursAgo / 24);
      
      let ageDisplay;
      if (daysAgo > 30) {
        ageDisplay = `${Math.floor(daysAgo / 30)} months ago`;
      } else if (daysAgo > 0) {
        ageDisplay = `${daysAgo} days ago`;
      } else if (hoursAgo > 0) {
        ageDisplay = `${hoursAgo} hours ago`;
      } else {
        ageDisplay = 'Just now';
      }
      
      return {
        icao: p.icao,
        price: p.price,
        cachedAt: p.last_updated,
        ageHours: hoursAgo,
        ageDisplay,
        source: p.source_site
      };
    });
    
    // Get total airports count
    const totalAirports = await database.get(`
      SELECT 
        SUM(CASE WHEN type = 'large_airport' THEN 1 ELSE 0 END) as large,
        SUM(CASE WHEN type = 'medium_airport' THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN type = 'small_airport' THEN 1 ELSE 0 END) as small,
        COUNT(*) as total
      FROM airports
    `);
    
    return NextResponse.json({
      summary: {
        totalAirports: totalAirports,
        totalFuelCached: fuelPrices.length,
        airportsWithFuel: airportsWithFuel,
        lastUpdate: fuelStats?.newest || null,
        nextUpdate: fuelStats?.newest ? 
          new Date(new Date(fuelStats.newest).getTime() + 72 * 60 * 60 * 1000).toISOString() : null,
        updateInterval: '72 hours'
      },
      fuelPrices: pricesWithAge
    });
    
  } catch (error) {
    console.error('Error fetching data status:', error);
    return NextResponse.json({ error: 'Failed to fetch data status' }, { status: 500 });
  }
}
