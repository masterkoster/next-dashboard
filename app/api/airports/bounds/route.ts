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

// GET /api/airports/bounds?minLat=30&maxLat=50&minLon=-120&maxLon=-70&minSize=small
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const minLat = parseFloat(searchParams.get('minLat') || '-90');
    const maxLat = parseFloat(searchParams.get('maxLat') || '90');
    const minLon = parseFloat(searchParams.get('minLon') || '-180');
    const maxLon = parseFloat(searchParams.get('maxLon') || '180');
    const minSize = searchParams.get('minSize') || 'small'; // small, medium, large, heli, seaplane
    const limit = parseInt(searchParams.get('limit') || '200');
    const icao = searchParams.get('icao'); // Single airport lookup
    
    const db = await getDb();
    
    // If single ICAO requested
    if (icao) {
      const airport = await db.get(`
        SELECT icao, iata, name, city, country, latitude, longitude, type, elevation_ft
        FROM airports 
        WHERE icao = ? OR iata = ?
      `, [icao.toUpperCase(), icao.toUpperCase()]);
      
      if (airport) {
        return NextResponse.json(airport);
      }
      return NextResponse.json({ error: 'Airport not found' }, { status: 404 });
    }
    
    // Build size filter - map sizes to airport types
    const typeFilters: Record<string, string[]> = {
      'large': ['large_airport'],
      'medium': ['large_airport', 'medium_airport'],
      'small': ['large_airport', 'medium_airport', 'small_airport'],
      'heli': ['large_airport', 'medium_airport', 'small_airport', 'heliport'],
      'seaplane': ['large_airport', 'medium_airport', 'small_airport', 'seaplane_base'],
    };
    
    const allowedTypes = typeFilters[minSize] || typeFilters['small'];
    const typePlaceholders = allowedTypes.map(() => '?').join(',');
    
    // Get airports in bounding box, ordered by size (larger first)
    const airports = await db.all(`
      SELECT icao, iata, name, city, country, latitude, longitude, type, elevation_ft
      FROM airports 
      WHERE latitude BETWEEN ? AND ?
        AND longitude BETWEEN ? AND ?
        AND type IN (${typePlaceholders})
        AND (is_closed IS NULL OR is_closed = 0)
      ORDER BY 
        CASE type 
          WHEN 'large_airport' THEN 1 
          WHEN 'medium_airport' THEN 2 
          WHEN 'small_airport' THEN 3 
          WHEN 'heliport' THEN 4 
          WHEN 'seaplane_base' THEN 5 
          ELSE 6 
        END,
        elevation_ft DESC
      LIMIT ?
    `, [minLat, maxLat, minLon, maxLon, ...allowedTypes, limit]);
    
    return NextResponse.json({
      airports,
      count: airports.length,
      bounds: { minLat, maxLat, minLon, maxLon }
    });
  } catch (error) {
    console.error('Error fetching airports:', error);
    return NextResponse.json({ error: 'Failed to fetch airports' }, { status: 500 });
  }
}
