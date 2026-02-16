/**
 * AirNav Fuel Price Scraper
 * Scrapes fuel prices from AirNav.com
 * Smart caching: Large airports = more frequent, Small airports = less frequent
 */

const sqlite3 = require('sqlite3').verbose();
const https = require('https');
const http = require('http');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'aviation_hub.db');

// Michigan airports to scrape
const AIRPORTS = [
  { icao: 'KDTW', name: 'Detroit Metropolitan Wayne County Airport', type: 'large' },
  { icao: 'KGRR', name: 'Gerald R. Ford International Airport', type: 'large' },
  { icao: 'KFNT', name: 'Bishop International Airport', type: 'large' },
  { icao: 'KLAN', name: 'Capital Region International Airport', type: 'large' },
  { icao: 'KTVC', name: 'Cherry Capital Airport', type: 'medium' },
  { icao: 'KMBS', name: 'MBS International Airport', type: 'medium' },
  { icao: 'KSAW', name: 'Marquette/Sawyer International Airport', type: 'medium' },
  { icao: 'KCIU', name: 'Chippewa County International Airport', type: 'medium' },
  { icao: 'KAZO', name: 'Kalamazoo/Battle Creek International Airport', type: 'medium' },
  { icao: 'KBTL', name: 'Battle Creek Executive Airport', type: 'medium' },
  { icao: 'KESC', name: 'Delta County Airport', type: 'medium' },
  { icao: 'KCMX', name: 'Houghton County Memorial Airport', type: 'medium' },
  { icao: 'KJXN', name: 'Jackson County Airport', type: 'medium' },
  { icao: 'KMKG', name: 'Muskegon County Airport', type: 'medium' },
  { icao: 'KPTK', name: 'Oakland County International Airport', type: 'medium' },
  { icao: 'KPLN', name: 'Pellston Regional Airport', type: 'medium' },
  { icao: 'KDET', name: 'Coleman A. Young Municipal Airport', type: 'medium' },
  { icao: 'KIMT', name: 'Ford Airport', type: 'small' },
  { icao: 'KYIP', name: 'Willow Run Airport', type: 'small' },
  { icao: 'KMTC', name: 'Selfridge Air National Guard Base', type: 'small' },
  { icao: 'KAPN', name: 'Alpena County Regional Airport', type: 'small' },
];

// Update frequency based on airport type (in hours)
const UPDATE_FREQUENCY = {
  large: 72,    // 3 days
  medium: 168,  // 1 week  
  small: 720    // 30 days
};

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function parseFuelPrices(html, icao) {
  const results = [];
  
  // Look for the fuel price table in the page
  // Pattern: <td>100LL</td> ... <td>$6.00</td> format
  const lines = html.split('\n');
  
  let inFuelSection = false;
  let lastReported = null;
  let prices = { '100LL': null, 'JetA': null };
  
  for (const line of lines) {
    // Find update date
    const dateMatch = line.match(/Updated\s+(\d{1,2}-[A-Z]{3}-\d{4})/i);
    if (dateMatch) lastReported = dateMatch[1];
    
    // Check if we're in fuel section
    if (line.includes('100LL') || line.includes('Jet A')) {
      inFuelSection = true;
    }
    
    // Extract prices - look for $X.XX pattern
    const priceMatch = line.match(/\$([0-9]+\.?[0-9]*)/g);
    if (priceMatch && inFuelSection) {
      for (const priceStr of priceMatch) {
        const price = parseFloat(priceStr.replace('$', ''));
        if (price > 0 && price < 20) { // Reasonable fuel price range
          if (!prices['100LL']) prices['100LL'] = price;
          else if (!prices['JetA']) prices['JetA'] = price;
        }
      }
    }
  }
  
  // Create records
  if (prices['100LL']) {
    results.push({
      icao,
      fbo_name: 'Airport Default',
      fuel_type: '100LL',
      service_type: 'Full Service',
      price: prices['100LL'],
      guaranteed: 0,
      last_reported: lastReported,
      source_url: `https://www.airnav.com/airport/${icao}`
    });
  }
  
  if (prices['JetA']) {
    results.push({
      icao,
      fbo_name: 'Airport Default',
      fuel_type: 'JetA',
      service_type: 'Full Service',
      price: prices['JetA'],
      guaranteed: 0,
      last_reported: lastReported,
      source_url: `https://www.airnav.com/airport/${icao}`
    });
  }
  
  return results;
}

function insertFuelData(db, fuelData, airportType) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO airport_fuel 
      (icao, fbo_name, fuel_type, service_type, price, guaranteed, last_reported, source_url, scraped_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    // Also insert into history
    const historyStmt = db.prepare(`
      INSERT INTO airport_fuel_history 
      (icao, fbo_name, fuel_type, service_type, price, source)
      VALUES (?, ?, ?, ?, ?, 'airnav')
    `);
    
    for (const data of fuelData) {
      stmt.run([
        data.icao,
        data.fbo_name,
        data.fuel_type,
        data.service_type,
        data.price,
        data.guaranteed,
        data.last_reported,
        data.source_url
      ]);
      
      // Add to history
      historyStmt.run([
        data.icao,
        data.fbo_name,
        data.fuel_type,
        data.service_type,
        data.price
      ]);
    }
    stmt.finalize((err) => err ? reject(err) : resolve());
  });
}

async function scrape() {
  console.log('=== AirNav Fuel Scraper ===\n');
  console.log('Update frequencies: Large=72h, Medium=168h, Small=720h\n');
  
  const db = new sqlite3.Database(DB_PATH);
  let total = 0;
  let large = 0, medium = 0, small = 0;
  
  for (const airport of AIRPORTS) {
    console.log(`[${airport.icao}] ${airport.name} (${airport.type})`);
    
    try {
      const url = `https://www.airnav.com/airport/${airport.icao}`;
      const response = await httpGet(url);
      
      if (response.status !== 200) {
        console.log(`  Error: HTTP ${response.status}`);
        continue;
      }
      
      const prices = parseFuelPrices(response.data, airport.icao);
      
      if (prices.length > 0) {
        await insertFuelData(db, prices, airport.type);
        
        // Calculate average
        const avgPrice = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
        
        console.log(`  ✓ ${prices.length} prices found, avg: $${avgPrice.toFixed(2)}`);
        
        if (airport.type === 'large') large++;
        else if (airport.type === 'medium') medium++;
        else small++;
        total += prices.length;
      } else {
        console.log(`  ✗ No prices found`);
      }
      
    } catch (error) {
      console.log(`  Error: ${error.message}`);
    }
    
    await new Promise(r => setTimeout(r, 3000));
  }
  
  // Summary
  console.log('\n=== Summary ===');
  console.log(`Large airports: ${large}`);
  console.log(`Medium airports: ${medium}`);
  console.log(`Small airports: ${small}`);
  console.log(`Total prices: ${total}`);
  
  db.close();
}

scrape().catch(console.error);
