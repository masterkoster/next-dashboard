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
    const icao = searchParams.get('icao')?.toUpperCase();
    
    if (!icao) {
      return NextResponse.json({ error: 'ICAO code required' }, { status: 400 });
    }
    
    const db = await getDb();
    
    // Get fuel data from cache
    const fuel = await db.get(`
      SELECT icao, data_type, price, source_site, last_updated
      FROM airport_cache
      WHERE icao = ? AND data_type = 'fuel'
    `, icao);
    
    if (fuel) {
      return NextResponse.json({
        icao: fuel.icao,
        price100ll: fuel.price,
        priceJetA: fuel.price, // Simplified - same price stored
        source: fuel.source_site,
        lastUpdated: fuel.last_updated
      });
    }
    
    return NextResponse.json({
      icao: icao,
      price100ll: null,
      priceJetA: null,
      source: null,
      lastUpdated: null,
      error: 'No fuel data available'
    }, { status: 404 });
  } catch (error) {
    console.error('Error fetching fuel data:', error);
    return NextResponse.json({ error: 'Failed to fetch fuel data' }, { status: 500 });
  }
}
