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
    
    const database = await getDb();
    
    // Get FBO fees from database
    const fees = await database.all(`
      SELECT icao, fbo_name, ramp_fee, overnight_fee, handling_fee, 
             fuel_minimum, credit_card_fee, callahead_required, phone, amenities, last_updated
      FROM fbo_fees
      WHERE icao = ?
    `, icao);
    
    if (!fees || fees.length === 0) {
      return NextResponse.json({
        icao,
        fbos: [],
        note: 'No FBO fee data available. Contribute fees to help other pilots!'
      });
    }
    
    const fbos = fees.map((f: any) => ({
      name: f.fbo_name,
      rampFee: f.ramp_fee,
      overnightFee: f.overnight_fee,
      handlingFee: f.handling_fee,
      fuelMinimum: f.fuel_minimum,
      creditCardFee: f.credit_card_fee,
      callAheadRequired: f.callahead_required === 1,
      phone: f.phone,
      amenities: f.amenities ? JSON.parse(f.amenities) : {},
      lastUpdated: f.last_updated
    }));
    
    return NextResponse.json({
      icao,
      fbos
    });
    
  } catch (error) {
    console.error('Error fetching FBO fees:', error);
    return NextResponse.json({ error: 'Failed to fetch FBO fees' }, { status: 500 });
  }
}

// POST - Submit new FBO fee data
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { icao, fboName, rampFee, overnightFee, handlingFee, fuelMinimum, phone, amenities } = body;
    
    if (!icao || !fboName) {
      return NextResponse.json({ error: 'ICAO and FBO name required' }, { status: 400 });
    }
    
    const database = await getDb();
    
    await database.run(`
      INSERT OR REPLACE INTO fbo_fees 
      (icao, fbo_name, ramp_fee, overnight_fee, handling_fee, fuel_minimum, phone, amenities, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'user')
    `, 
      icao.toUpperCase(),
      fboName,
      rampFee || null,
      overnightFee || null,
      handlingFee || null,
      fuelMinimum || null,
      phone || null,
      amenities ? JSON.stringify(amenities) : null
    );
    
    return NextResponse.json({
      success: true,
      message: 'FBO fee data submitted. Thanks for contributing!'
    });
    
  } catch (error) {
    console.error('Error saving FBO fees:', error);
    return NextResponse.json({ error: 'Failed to save FBO fees' }, { status: 500 });
  }
}
