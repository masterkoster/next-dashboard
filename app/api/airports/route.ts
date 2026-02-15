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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || 'all'; // all, large, medium, small
    
    const db = await getDb();
    
    let sql = `
      SELECT icao, iata, name, city, state, country, type, latitude, longitude, elevation_ft
      FROM airports
      WHERE (icao LIKE ? OR iata LIKE ? OR name LIKE ? OR city LIKE ?)
    `;
    
    const searchTerm = `%${query}%`;
    const params: any[] = [searchTerm, searchTerm, searchTerm, searchTerm];
    
    // Filter by type
    if (type === 'large') {
      sql += " AND type = 'large_airport'";
    } else if (type === 'medium') {
      sql += " AND type = 'medium_airport'";
    } else if (type === 'small') {
      sql += " AND type = 'small_airport'";
    }
    
    sql += ' ORDER BY type, icao LIMIT ?';
    params.push(limit);
    
    const airports = await db.all(sql, params);
    
    return NextResponse.json({ airports });
  } catch (error) {
    console.error('Error fetching airports:', error);
    return NextResponse.json({ error: 'Failed to fetch airports' }, { status: 500 });
  }
}
