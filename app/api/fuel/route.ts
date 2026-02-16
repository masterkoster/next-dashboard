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

// Attribution for AirNav
const AIRNAV_ATTRIBUTION = {
  name: 'AirNav',
  url: 'https://www.airnav.com',
  airbossUrl: 'https://www.airnav.com/airboss/',
  description: 'Fuel prices provided by AirNav.com - the leading aviation fuel price database'
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const icao = searchParams.get('icao')?.toUpperCase();
    const includeHistory = searchParams.get('history') === 'true';
    
    if (!icao) {
      return NextResponse.json({ error: 'ICAO code required' }, { status: 400 });
    }
    
    const database = await getDb();
    
    // Get current fuel prices from airport_fuel table
    const fuel = await database.all(`
      SELECT icao, fbo_name, fuel_type, service_type, price, guaranteed, last_reported, source_url, scraped_at
      FROM airport_fuel
      WHERE icao = ?
    `, icao);
    
    if (!fuel || fuel.length === 0) {
      return NextResponse.json({
        icao,
        prices: [],
        attribution: AIRNAV_ATTRIBUTION,
        error: 'No fuel data available'
      }, { status: 404 });
    }
    
    // Format prices
    const prices = fuel.map((f: any) => ({
      fuelType: f.fuel_type,
      serviceType: f.service_type,
      price: f.price,
      fboName: f.fbo_name,
      lastReported: f.last_reported,
      guaranteed: f.guaranteed === 1,
      sourceUrl: f.source_url
    }));
    
    // Calculate average
    const avg100LL = prices.filter((p: any) => p.fuelType === '100LL').reduce((sum: number, p: any) => sum + p.price, 0) / prices.filter((p: any) => p.fuelType === '100LL').length || null;
    const avgJetA = prices.filter((p: any) => p.fuelType === 'JetA').reduce((sum: number, p: any) => sum + p.price, 0) / prices.filter((p: any) => p.fuelType === 'JetA').length || null;
    
    // Get history if requested
    let history = null;
    if (includeHistory) {
      history = await database.all(`
        SELECT fuel_type, price, recorded_at
        FROM airport_fuel_history
        WHERE icao = ?
        ORDER BY recorded_at DESC
        LIMIT 30
      `, icao);
    }
    
    return NextResponse.json({
      icao,
      prices,
      average: {
        '100LL': avg100LL ? avg100LL.toFixed(2) : null,
        'JetA': avgJetA ? avgJetA.toFixed(2) : null
      },
      scrapedAt: fuel[0]?.scraped_at,
      attribution: AIRNAV_ATTRIBUTION,
      history: history ? history.map((h: any) => ({
        fuelType: h.fuel_type,
        price: h.price,
        recordedAt: h.recorded_at
      })) : null
    });
    
  } catch (error) {
    console.error('Error fetching fuel data:', error);
    return NextResponse.json({ error: 'Failed to fetch fuel data' }, { status: 500 });
  }
}

// POST - Add or update fuel price (for user submissions)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { icao, fuelType, serviceType, price, fboName, source } = body;
    
    if (!icao || !price) {
      return NextResponse.json({ error: 'icao and price required' }, { status: 400 });
    }
    
    const database = await getDb();
    
    // Insert/update current price
    await database.run(`
      INSERT OR REPLACE INTO airport_fuel 
      (icao, fbo_name, fuel_type, service_type, price, guaranteed, last_reported, source_url, scraped_at)
      VALUES (?, ?, ?, ?, ?, 0, datetime('now'), ?, datetime('now'))
    `, icao.toUpperCase(), fboName || 'User Submitted', fuelType || '100LL', serviceType || 'Full Service', price, source || 'user');
    
    // Add to history
    await database.run(`
      INSERT INTO airport_fuel_history 
      (icao, fbo_name, fuel_type, service_type, price, source)
      VALUES (?, ?, ?, ?, ?, 'user')
    `, icao.toUpperCase(), fboName || 'User Submitted', fuelType || '100LL', serviceType || 'Full Service', price);
    
    return NextResponse.json({
      success: true,
      icao: icao.toUpperCase(),
      price,
      message: 'Fuel price submitted. Thanks for contributing!'
    });
  } catch (error) {
    console.error('Error saving fuel data:', error);
    return NextResponse.json({ error: 'Failed to save fuel data' }, { status: 500 });
  }
}
