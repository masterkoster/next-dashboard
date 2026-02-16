/**
 * Nearest Cheap Fuel API
 * Find lowest 100LL price within a given airport
 */

import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'aviation_hub.db');

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const icao = searchParams.get('icao');
  const radius = searchParams.get('radius') || '50';

  if (!icao) {
    return NextResponse.json({ error: 'Missing icao parameter' }, { status: 400 });
  }

  const radiusNm = parseInt(radius);

  if (isNaN(radiusNm) || radiusNm < 1 || radiusNm > 500) {
    return NextResponse.json({ error: 'Invalid radius (1-500 nm)' }, { status: 400 });
  }

  const db = new sqlite3.Database(DB_PATH);

  try {
    // First get the center airport coordinates
    db.get("SELECT icao, latitude, longitude FROM airports WHERE icao = ?", [icao.toUpperCase()], (err, center) => {
      if (err || !center) {
        db.close();
        return NextResponse.json({ error: 'Airport not found', icao: icao.toUpperCase() }, { status: 404 });
      }

      // Calculate distance and find fuel prices
      // Using Haversine formula for distance in NM
      const sql = `
        SELECT 
          af.icao,
          a.name,
          a.city,
          a.state,
          a.latitude,
          a.longitude,
          a.type,
          af.price,
          af.fuel_type,
          af.last_reported,
          af.source_url,
          (6371 * acos(cos(radians(?)) * cos(radians(a.latitude)) * 
           cos(radians(a.longitude) - radians(?)) + sin(radians(?)) * 
           sin(radians(a.latitude)))) * 0.539997 AS distance_nm
        FROM airport_fuel af
        JOIN airports a ON af.icao = a.icao
        WHERE af.fuel_type = '100LL' 
          AND af.price IS NOT NULL 
          AND af.price > 0
        HAVING distance_nm <= ?
        ORDER BY af.price ASC, distance_nm ASC
        LIMIT 20
      `;

      db.all(sql, [center.latitude, center.longitude, center.latitude, radiusNm], (err, rows) => {
        db.close();

        if (err) {
          console.error('Database error:', err);
          return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        // Format results
        const results = rows.map((row: any) => ({
          icao: row.icao,
          name: row.name,
          city: row.city,
          state: row.state,
          latitude: row.latitude,
          longitude: row.longitude,
          type: row.type,
          price100ll: row.price,
          fuelType: row.fuel_type,
          lastReported: row.last_reported,
          sourceUrl: row.source_url,
          distanceNm: Math.round(row.distance_nm * 10) / 10,
          direction: getDirection(center.latitude, center.longitude, row.latitude, row.longitude)
        }));

        return NextResponse.json({
          centerAirport: icao.toUpperCase(),
          radiusNm: radiusNm,
          count: results.length,
          results
        });
      });
    });
  } catch (error) {
    db.close();
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Calculate compass direction from center to point
function getDirection(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  bearing = (bearing + 360) % 360;

  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(bearing / 22.5) % 16;

  return directions[index];
}
