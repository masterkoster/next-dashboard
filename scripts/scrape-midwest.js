/**
 * AirNav Fuel Price Scraper - Midwest Region
 * Scrapes fuel prices from AirNav.com
 * Smart caching: Large = 72h, Medium = 168h
 */

const sqlite3 = require('sqlite3').verbose();
const https = require('https');
const http = require('http');

const DB_PATH = require('path').join(__dirname, '..', 'data', 'aviation_hub.db');

// Midwest US states
const MIDWEST_STATES = ['IL', 'IN', 'MI', 'OH', 'WI', 'MN', 'IA', 'MO', 'KS', 'ND', 'NE', 'SD'];

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function parseAirportData(html) {
  const results = [];
  const lines = html.split('\n');
  
  // Data to extract
  let lastReported = null;
  let prices = { '100LL': null, 'JetA': null };
  let hasTower = 0;
  let attendance = null;
  let phone = null;
  let landingFee = null;
  let manager = null;
  
  // Parse all data from HTML
  const fullHtml = html;
  
  // Extract prices
  for (const line of lines) {
    const dateMatch = line.match(/Updated\s+(\d{1,2}-[A-Z]{3}-\d{4})/i);
    if (dateMatch) lastReported = dateMatch[1];
    
    const priceMatch = line.match(/\$([0-9]+\.?[0-9]*)/g);
    if (priceMatch) {
      for (const priceStr of priceMatch) {
        const price = parseFloat(priceStr.replace('$', ''));
        if (price > 0 && price < 20) {
          if (!prices['100LL']) prices['100LL'] = price;
          else if (!prices['JetA']) prices['JetA'] = price;
        }
        // Check for landing fee (usually $XX)
        if (line.includes('Landing fee') || line.includes('landing fee')) {
          if (price > 0 && price < 500) {
            landingFee = price;
          }
        }
      }
    }
  }
  
  // Extract tower - look for "Control tower: yes" or "Tower: yes"
  if (fullHtml.match(/Control tower:\s*yes/i) || fullHtml.match(/Tower:\s*yes/i)) {
    hasTower = 1;
  }
  
  // Extract attendance - "Attendance:"
  const attendanceMatch = fullHtml.match(/Attendance:[^<]*<td[^>]*>([^<]+)<\/td>/i);
  if (attendanceMatch) {
    attendance = attendanceMatch[1].trim();
  }
  
  // Extract phone - look for phone numbers
  const phoneMatch = fullHtml.match(/(\d{3}[-.]?\d{3}[-.]?\d{4})/);
  if (phoneMatch) {
    phone = phoneMatch[1];
  }
  
  // Extract manager - "Manager:"
  const managerMatch = fullHtml.match(/Manager:[^<]*<td[^>]*>([^<]+)<\/td>/i);
  if (managerMatch) {
    manager = managerMatch[1].trim();
  }
  
  // Extract landing fee if found in more specific location
  const landingMatch = fullHtml.match(/Landing fee:[^<]*<td[^>]*>\s*([^<$]+)/i);
  if (landingMatch) {
    const fee = parseFloat(landingMatch[1].replace(/[$,]/g, ''));
    if (!isNaN(fee) && fee > 0 && fee < 500) {
      landingFee = fee;
    }
  }
  
  if (prices['100LL']) {
    results.push({ 
      fuel_type: '100LL', 
      price: prices['100LL'], 
      last_reported: lastReported,
      has_tower: hasTower,
      attendance: attendance,
      phone: phone,
      landing_fee: landingFee,
      manager: manager
    });
  }
  if (prices['JetA']) {
    results.push({ 
      fuel_type: 'JetA', 
      price: prices['JetA'], 
      last_reported: lastReported,
      has_tower: hasTower,
      attendance: attendance,
      phone: phone,
      landing_fee: landingFee,
      manager: manager
    });
  }
  
  return results;
}

async function scrape() {
  console.log('=== AirNav Fuel Scraper - Midwest ===\n');
  
  const db = new sqlite3.Database(DB_PATH);
  
  // Get all Midwest large airports
  db.all("SELECT icao, name, state FROM airports WHERE type = 'large_airport' AND state LIKE 'US-%' AND substr(state, 4, 2) IN ('IL', 'IN', 'MI', 'OH', 'WI', 'MN', 'IA', 'MO', 'KS', 'ND', 'NE', 'SD') ORDER BY state, name", [], async (err, largeAirports) => {
    if (err) { console.error(err); db.close(); return; }
    
    console.log(`Found ${largeAirports.length} large airports in Midwest\n`);
    
    let total = 0;
    
    for (const airport of largeAirports) {
      console.log(`[${airport.icao}] ${airport.name} (${airport.state})`);
      
      try {
        const url = `https://www.airnav.com/airport/${airport.icao}`;
        const response = await httpGet(url);
        
        if (response.status === 200) {
          const prices = parseAirportData(response.data);
          
          if (prices.length > 0) {
            for (const p of prices) {
              db.run(`INSERT OR REPLACE INTO airport_fuel (icao, fbo_name, fuel_type, service_type, price, guaranteed, last_reported, source_url, scraped_at, has_tower, attendance, phone, landing_fee, manager) VALUES (?, 'Airport Default', ?, 'Full Service', ?, 0, ?, ?, datetime('now'), ?, ?, ?, ?, ?)`,
                [airport.icao, p.fuel_type, p.price, p.last_reported, url, p.has_tower || 0, p.attendance, p.phone, p.landing_fee, p.manager]);
              db.run(`INSERT INTO airport_fuel_history (icao, fbo_name, fuel_type, service_type, price, source) VALUES (?, 'Airport Default', ?, 'Full Service', ?, 'airnav')`,
                [airport.icao, p.fuel_type, p.price]);
            }
            console.log(`  ✓ ${prices.map(p => `$${p.price}`).join(', ')}${prices[0].has_tower ? ' � tower' : ''}${prices[0].landing_fee ? ' 💰' : ''}`);
            total += prices.length;
          } else {
            console.log(`  ✗ No prices`);
          }
        } else {
          console.log(`  ✗ HTTP ${response.status}`);
        }
      } catch (e) {
        console.log(`  ✗ ${e.message}`);
      }
      
      await new Promise(r => setTimeout(r, 2500));
    }
    
    // Get medium airports
    db.all("SELECT icao, name, state FROM airports WHERE type = 'medium_airport' AND state LIKE 'US-%' AND substr(state, 4, 2) IN ('IL', 'IN', 'MI', 'OH', 'WI', 'MN', 'IA', 'MO', 'KS', 'ND', 'NE', 'SD') ORDER BY state, name", async (err, mediumAirports) => {
      console.log(`\nFound ${mediumAirports.length} medium airports...\n`);
      
      for (const airport of mediumAirports) {
        process.stdout.write(`[${airport.icao}] ${airport.name}...`);
        
        try {
          const url = `https://www.airnav.com/airport/${airport.icao}`;
          const response = await httpGet(url);
          
          if (response.status === 200) {
            const prices = parseAirportData(response.data);
            
            if (prices.length > 0) {
              for (const p of prices) {
                db.run(`INSERT OR REPLACE INTO airport_fuel (icao, fbo_name, fuel_type, service_type, price, guaranteed, last_reported, source_url, scraped_at) VALUES (?, 'Airport Default', ?, 'Full Service', ?, 0, ?, ?, datetime('now'))`,
                  [airport.icao, p.fuel_type, p.price, p.last_reported, url]);
                db.run(`INSERT INTO airport_fuel_history (icao, fbo_name, fuel_type, service_type, price, source) VALUES (?, 'Airport Default', ?, 'Full Service', ?, 'airnav')`,
                  [airport.icao, p.fuel_type, p.price]);
              }
              console.log(` ✓ ${prices.map(p => `$${p.price}`).join(', ')}`);
              total += prices.length;
            } else {
              console.log(` ✗`);
            }
          } else {
            console.log(` ✗ HTTP ${response.status}`);
          }
        } catch (e) {
          console.log(` ✗ ${e.message}`);
        }
        
        await new Promise(r => setTimeout(r, 2000));
      }
      
      console.log(`\n=== Summary ===`);
      console.log(`Total prices scraped: ${total}`);
      
      db.get("SELECT COUNT(DISTINCT icao) as count FROM airport_fuel", [], (err, row) => {
        console.log(`Airports with fuel data: ${row.count}`);
        db.close();
      });
    });
  });
}

scrape().catch(console.error);
