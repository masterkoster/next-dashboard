/**
 * Weather API - Cached weather data from aviationweather.gov
 * Supports tiered caching based on zoom level
 * 
 * Regions (10 zones):
 * - chi: Great Lakes (IL, IN, MI, OH, WI) + North Central (IA, KS, MN, MO, ND, NE, SD)
 * - bos: Northeast (CT, ME, MA, NH, NJ, NY, PA, RI, VT)
 * - mia: Southeast (DE, FL, GA, MD, NC, SC, VA, WV, DC)
 * - dfw: South Central (AL, AR, KY, LA, MS, OK, TN, TX)
 * - sfo: Pacific (CA, OR, WA) + Southwest (AZ, NV, UT)
 * - slc: Central (CO, MT, NM, WY)
 * - alaska: Alaska
 * - hawaii: Hawaii
 */

const sqlite3 = require('sqlite3').verbose();
const https = require('https');
const http = require('http');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', '..', 'data', 'aviation_hub.db');

// Weather region mapping
const REGION_MAP = {
  // Great Lakes + North Central
  'chi': { states: ['IL', 'IN', 'MI', 'OH', 'WI', 'IA', 'KS', 'MN', 'MO', 'ND', 'NE', 'SD'], name: 'Great Lakes/North Central' },
  // Northeast
  'bos': { states: ['CT', 'ME', 'MA', 'NH', 'NJ', 'NY', 'PA', 'RI', 'VT'], name: 'Northeast' },
  // Southeast
  'mia': { states: ['DE', 'FL', 'GA', 'MD', 'NC', 'SC', 'VA', 'WV', 'DC'], name: 'Southeast' },
  // South Central
  'dfw': { states: ['AL', 'AR', 'KY', 'LA', 'MS', 'OK', 'TN', 'TX'], name: 'South Central' },
  // Pacific + Southwest
  'sfo': { states: ['CA', 'OR', 'WA', 'AZ', 'NV', 'UT'], name: 'Pacific/Southwest' },
  // Central
  'slc': { states: ['CO', 'MT', 'NM', 'WY'], name: 'Central/Rockies' },
  // Alaska
  'alaska': { states: ['AK'], name: 'Alaska' },
  // Hawaii
  'hawaii': { states: ['HI'], name: 'Hawaii' }
};

// Cache durations (in hours)
const CACHE_DURATION = {
  regional: 24,   // Wind/temp forecasts
  metar: 6,       // Airport METAR
  taf: 6          // TAF forecasts
};

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { 
      headers: { 'User-Agent': 'AviationHub/1.0' },
      timeout: 15000 
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// Get region code for a state
function getRegionForState(state) {
  for (const [code, info] of Object.entries(REGION_MAP)) {
    if (info.states.includes(state)) return code;
  }
  return 'chi'; // default
}

export default async function handler(req, res) {
  const { type, icao, region, forceRefresh } = req.query;

  if (req.method === 'GET') {
    const db = new sqlite3.Database(DB_PATH);

    // GET: Fetch weather data
    
    // If icao provided, get airport weather
    if (icao) {
      const icaoUpper = icao.toUpperCase();
      
      // Check cache first
      if (!forceRefresh) {
        const cached = await new Promise((resolve) => {
          db.get(
            `SELECT data, fetched_at, expires_at FROM weather_cache 
             WHERE icao = ? AND data_type = 'metar' AND expires_at > datetime('now')`,
            [icaoUpper],
            (err, row) => resolve(row)
          );
        });

        if (cached) {
          db.close();
          return res.json({
            source: 'cache',
            icao: icaoUpper,
            data: JSON.parse(cached.data),
            fetchedAt: cached.fetched_at,
            expiresAt: cached.expires_at
          });
        }
      }

      // Fetch fresh METAR
      try {
        const url = `https://aviationweather.gov/api/data/metar?ids=${icaoUpper}&format=json`;
        const response = await httpGet(url);

        if (response.status === 200) {
          const metarData = JSON.parse(response.data);
          
          // Cache it
          const expiresAt = new Date(Date.now() + CACHE_DURATION.metar * 60 * 60 * 1000);
          await new Promise((resolve) => {
            db.run(
              `INSERT OR REPLACE INTO weather_cache (id, region, icao, data_type, data, fetched_at, expires_at)
               VALUES (?, NULL, ?, 'metar', ?, datetime('now'), ?)`,
              [`metar-${icaoUpper}`, icaoUpper, JSON.stringify(metarData), expiresAt.toISOString()],
              (err) => resolve()
            );
          });

          db.close();
          return res.json({
            source: 'live',
            icao: icaoUpper,
            data: metarData,
            fetchedAt: new Date().toISOString(),
            expiresAt: expiresAt.toISOString()
          });
        } else {
          db.close();
          return res.status(response.status).json({ error: 'Failed to fetch METAR' });
        }
      } catch (error) {
        db.close();
        return res.status(500).json({ error: error.message });
      }
    }

    // If region provided, get regional winds/temps
    if (region) {
      const regionLower = region.toLowerCase();
      
      // Check cache
      if (!forceRefresh) {
        const cached = await new Promise((resolve) => {
          db.get(
            `SELECT data, fetched_at, expires_at FROM weather_cache 
             WHERE region = ? AND data_type = 'windtemp' AND expires_at > datetime('now')`,
            [regionLower],
            (err, row) => resolve(row)
          );
        });

        if (cached) {
          db.close();
          return res.json({
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
          await new Promise((resolve) => {
            db.run(
              `INSERT OR REPLACE INTO weather_cache (id, region, icao, data_type, data, fetched_at, expires_at)
               VALUES (?, ?, NULL, 'windtemp', ?, datetime('now'), ?)`,
              [`windtemp-${regionLower}`, regionLower, JSON.stringify(windData), expiresAt.toISOString()],
              (err) => resolve()
            );
          });

          db.close();
          return res.json({
            source: 'live',
            region: regionLower,
            data: windData,
            fetchedAt: new Date().toISOString(),
            expiresAt: expiresAt.toISOString()
          });
        } else {
          db.close();
          return res.status(response.status).json({ error: 'Failed to fetch wind data' });
        }
      } catch (error) {
        db.close();
        return res.status(500).json({ error: error.message });
      }
    }

    // Return available regions
    db.close();
    return res.json({
      regions: Object.entries(REGION_MAP).map(([code, info]) => ({
        code,
        name: info.name,
        states: info.states
      }))
    });
  }

  // POST: Force refresh cache
  if (req.method === 'POST') {
    const { icao, region } = req.body;
    const db = new sqlite3.Database(DB_PATH);

    // Clear cache for this item
    if (icao) {
      await new Promise((resolve) => {
        db.run('DELETE FROM weather_cache WHERE icao = ?', [icao.toUpperCase()], () => resolve());
      });
    }
    if (region) {
      await new Promise((resolve) => {
        db.run('DELETE FROM weather_cache WHERE region = ?', [region.toLowerCase()], () => resolve());
      });
    }

    db.close();
    return res.json({ message: 'Cache cleared', icao, region });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
