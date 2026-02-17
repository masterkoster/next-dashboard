/**
 * Weather API - Cached weather data from aviationweather.gov
 * Supports tiered caching based on zoom level
 */

import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import https from 'https';
import http from 'http';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'aviation_hub.db');

// Weather region mapping
const REGION_MAP: Record<string, { states: string[]; name: string }> = {
  chi: { states: ['IL', 'IN', 'MI', 'OH', 'WI', 'IA', 'KS', 'MN', 'MO', 'ND', 'NE', 'SD'], name: 'Great Lakes/North Central' },
  bos: { states: ['CT', 'ME', 'MA', 'NH', 'NJ', 'NY', 'PA', 'RI', 'VT'], name: 'Northeast' },
  mia: { states: ['DE', 'FL', 'GA', 'MD', 'NC', 'SC', 'VA', 'WV', 'DC'], name: 'Southeast' },
  dfw: { states: ['AL', 'AR', 'KY', 'LA', 'MS', 'OK', 'TN', 'TX'], name: 'South Central' },
  sfo: { states: ['CA', 'OR', 'WA', 'AZ', 'NV', 'UT'], name: 'Pacific/Southwest' },
  slc: { states: ['CO', 'MT', 'NM', 'WY'], name: 'Central/Rockies' },
  alaska: { states: ['AK'], name: 'Alaska' },
  hawaii: { states: ['HI'], name: 'Hawaii' }
};

// Cache durations (in hours)
const CACHE_DURATION = {
  regional: 24,
  metar: 6,
  taf: 6
};

function httpGet(url: string): Promise<{ status: number; data: string }> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { 
      headers: { 'User-Agent': 'AviationHub/1.0' },
      timeout: 15000 
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode || 500, data }));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const icao = searchParams.get('icao');
  const region = searchParams.get('region');
  const forceRefresh = searchParams.get('forceRefresh') === 'true';
  const forecastDate = searchParams.get('forecast'); // YYYY-MM-DD format

  const db = new sqlite3.Database(DB_PATH);

  // If icao provided, get airport weather
  if (icao) {
    const icaoUpper = icao.toUpperCase();
    
    // Check cache first for METAR
    if (!forceRefresh) {
      const cached = await new Promise<any>((resolve) => {
        db.get(
          `SELECT data, fetched_at, expires_at FROM weather_cache 
           WHERE icao = ? AND data_type = 'metar' AND expires_at > datetime('now')`,
          [icaoUpper],
          (err, row) => resolve(row)
        );
      });

      if (cached) {
        // Also try to get TAF if requested
        let tafData = null;
        const tafCached = await new Promise<any>((resolve) => {
          db.get(
            `SELECT data, fetched_at FROM weather_cache 
             WHERE icao = ? AND data_type = 'taf'`,
            [icaoUpper],
            (err, row) => resolve(row)
          );
        });
        
        if (tafCached) {
          try {
            tafData = JSON.parse(tafCached.data);
          } catch (e) {}
        }

        db.close();
        return NextResponse.json({
          source: 'cache',
          icao: icaoUpper,
          data: JSON.parse(cached.data),
          taf: tafData,
          fetchedAt: cached.fetched_at,
          expiresAt: cached.expires_at
        });
      }
    }

    // Fetch fresh METAR
    try {
      const url = `https://aviationweather.gov/api/data/metar?ids=${icaoUpper}&format=json`;
      const response = await httpGet(url);

      let metarData: any = null;
      let tafData: any = null;

      if (response.status === 200) {
        metarData = JSON.parse(response.data);
        
        // Cache METAR
        const expiresAt = new Date(Date.now() + CACHE_DURATION.metar * 60 * 60 * 1000);
        await new Promise<void>((resolve) => {
          db.run(
            `INSERT OR REPLACE INTO weather_cache (id, region, icao, data_type, data, fetched_at, expires_at)
             VALUES (?, NULL, ?, 'metar', ?, datetime('now'), ?)`,
            [`metar-${icaoUpper}`, icaoUpper, JSON.stringify(metarData), expiresAt.toISOString()],
            () => resolve()
          );
        });
      }

      // Fetch TAF (Terminal Area Forecast)
      try {
        const tafUrl = `https://aviationweather.gov/api/data/taf?ids=${icaoUpper}&format=json`;
        const tafResponse = await httpGet(tafUrl);
        
        if (tafResponse.status === 200) {
          tafData = JSON.parse(tafResponse.data);
          
          // Cache TAF
          const tafExpiresAt = new Date(Date.now() + CACHE_DURATION.taf * 60 * 60 * 1000);
          await new Promise<void>((resolve) => {
            db.run(
              `INSERT OR REPLACE INTO weather_cache (id, region, icao, data_type, data, fetched_at, expires_at)
               VALUES (?, NULL, ?, 'taf', ?, datetime('now'), ?)`,
              [`taf-${icaoUpper}`, icaoUpper, JSON.stringify(tafData), tafExpiresAt.toISOString()],
              () => resolve()
            );
          });
        }
      } catch (tafError) {
        console.log('TAF fetch error:', tafError);
      }

      db.close();
      return NextResponse.json({
        source: 'live',
        icao: icaoUpper,
        data: metarData,
        taf: tafData,
        fetchedAt: new Date().toISOString()
      });
    } catch (error: any) {
      db.close();
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // If region provided, get regional winds/temps
  if (region) {
    const regionLower = region.toLowerCase();
    
    // Check cache
    if (!forceRefresh) {
      const cached = await new Promise<any>((resolve) => {
        db.get(
          `SELECT data, fetched_at, expires_at FROM weather_cache 
           WHERE region = ? AND data_type = 'windtemp' AND expires_at > datetime('now')`,
          [regionLower],
          (err, row) => resolve(row)
        );
      });

      if (cached) {
        db.close();
        return NextResponse.json({
          source: 'cache',
          region: regionLower,
          data: JSON.parse(cached.data),
          fetchedAt: cached.fetched_at,
          expiresAt: cached.expires_at
        });
      }
    }

    // Fetch fresh wind/temp data
    try {
      const url = `https://aviationweather.gov/api/data/windtemp?region=${regionLower}&format=json`;
      const response = await httpGet(url);

      if (response.status === 200) {
        const windData = JSON.parse(response.data);
        
        // Cache it
        const expiresAt = new Date(Date.now() + CACHE_DURATION.regional * 60 * 60 * 1000);
        await new Promise<void>((resolve) => {
          db.run(
            `INSERT OR REPLACE INTO weather_cache (id, region, icao, data_type, data, fetched_at, expires_at)
             VALUES (?, ?, NULL, 'windtemp', ?, datetime('now'), ?)`,
            [`windtemp-${regionLower}`, regionLower, JSON.stringify(windData), expiresAt.toISOString()],
            () => resolve()
          );
        });

        db.close();
        return NextResponse.json({
          source: 'live',
          region: regionLower,
          data: windData,
          fetchedAt: new Date().toISOString(),
          expiresAt: expiresAt.toISOString()
        });
      } else {
        db.close();
        return NextResponse.json({ error: 'Failed to fetch wind data' }, { status: response.status });
      }
    } catch (error: any) {
      db.close();
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Return available regions
  db.close();
  return NextResponse.json({
    regions: Object.entries(REGION_MAP).map(([code, info]) => ({
      code,
      name: info.name,
      states: info.states
    }))
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { icao, region } = await request.json();
  const db = new sqlite3.Database(DB_PATH);

  // Clear cache for this item
  if (icao) {
    await new Promise<void>((resolve) => {
      db.run('DELETE FROM weather_cache WHERE icao = ?', [icao.toUpperCase()], () => resolve());
    });
  }
  if (region) {
    await new Promise<void>((resolve) => {
      db.run('DELETE FROM weather_cache WHERE region = ?', [region.toLowerCase()], () => resolve());
    });
  }

  db.close();
  return NextResponse.json({ message: 'Cache cleared', icao, region });
}
