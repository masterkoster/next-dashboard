/**
 * Script to fetch and cache aviation fuel prices from 100LL.com
 * Usage: node scripts/fetch-fuel-prices.js [state]
 * Example: node scripts/fetch-fuel-prices.js US-MI
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const https = require('https');
const http = require('http');

// Database path
const DB_PATH = path.join(__dirname, '..', 'data', 'aviation_hub.db');

// Get state from command line or default to Michigan
const STATE = process.argv[2] || 'US-MI';

// Michigan large airports (manually collected from the database)
const MICHIGAN_AIRPORTS = [
  { icao: 'KFNT', name: 'Bishop International', city: 'Flint' },
  { icao: 'KLAN', name: 'Capital Region International', city: 'Lansing' },
  { icao: 'KTVC', name: 'Cherry Capital', city: 'Traverse City' },
  { icao: 'KCIU', name: 'Chippewa County International', city: 'Kincheloe' },
  { icao: 'KDTW', name: 'Detroit Metropolitan Wayne County', city: 'Detroit' },
  { icao: 'KGRR', name: 'Gerald R. Ford International', city: 'Grand Rapids' },
  { icao: 'KMBS', name: 'MBS International', city: 'Freeland' },
  { icao: 'KSAW', name: 'Marquette/Sawyer International', city: 'Gwinn' },
  // Medium airports
  { icao: 'KADG', name: 'Kalamazoo/Battle Creek International', city: 'Kalamazoo' },
  { icao: 'KAMN', name: 'Gratiot Community', city: 'Alma' },
  { icao: 'KAZO', name: 'Kalamazoo/Battle Creek International', city: 'Kalamazoo' },
  { icao: 'KBAX', name: 'Hancock', city: 'Bad Axe' },
  { icao: 'KBEH', name: 'Southwest Michigan Regional', city: 'Benton Harbor' },
  { icao: 'KBIV', name: 'West Michigan Regional', city: 'Holland' },
  { icao: 'KC91', name: 'Dowagiac Municipal', city: 'Dowagiac' },
  { icao: 'KDRM', name: 'Drummond Island', city: 'Drummond Island' },
  { icao: 'KESC', name: 'Delta County', city: 'Escanaba' },
  { icao: 'KFFX', name: 'Oscoda County', city: 'Oscoda' },
  { icao: 'KFLD', name: 'Joe D. Wicker', city: 'Lapeer' },
  { icao: 'KGAK', name: 'Gore Bay Municipal', city: 'Gore Bay' },
  { icao: 'KGLR', name: 'Cloquet', city: 'Cloquet' },
  { icao: 'KHMU', name: 'Hall-Alexander Field', city: 'Houghton' },
  { icao: 'KHTL', name: 'Roscommon County', city: 'Roscommon' },
  { icao: 'KIWX', name: 'Fulton County', city: 'Wauseon' },
  { icao: 'KJYM', name: 'St. Mary\'s Airport', city: 'Mount Pleasant' },
  { icao: 'KLDM', name: 'Mason County', city: 'Ludington' },
  { icao: 'KLEW', name: 'Auburn', city: 'Auburn' },
  { icao: 'KMGC', name: 'Michigan City Municipal', city: 'Michigan City' },
  { icao: 'KMOP', name: 'Mount Pleasant Municipal', city: 'Mount Pleasant' },
  { icao: 'KOGM', name: 'Knox County', city: 'St. James' },
  { icao: 'KONZ', name: 'Grosse Ile Municipal', city: 'Grosse Ile' },
  { icao: 'KOXI', name: 'Starke County', city: 'Knox' },
  { icao: 'KPHN', name: 'St. Clair County International', city: 'Port Huron' },
  { icao: 'KPTK', name: 'Oakland County International', city: 'Waterford' },
  { icao: 'KRCR', name: 'Fulton County', city: 'Rochester' },
  { icao: 'KRZL', name: 'Jasper County', city: 'Rensselaer' },
  { icao: 'KSJX', name: 'Schoolcraft County', city: 'Manistique' },
  { icao: 'KSLH', name: 'Cheboygan County', city: 'Cheboygan' },
  { icao: 'KTTF', name: 'Monroe County', city: 'Monroe' },
  { icao: 'KVSF', name: 'Thomas Field', city: 'St. Johns' },
  { icao: 'KW92', name: 'Alpena County', city: 'Alpena' },
  { icao: 'KWIN', name: 'Stella', city: 'New Hudson' },
  { icao: 'KY70', name: 'Custer County', city: 'Mancelona' },
  { icao: 'Y83', name: 'Sandusky City', city: 'Sandusky' },
];

// Helper function to make HTTP requests
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Parse fuel price from 100LL.com response
function parseFuelPrices(html, icao) {
  const prices = { ll: null, jetA: null };
  
  try {
    // Look for 100LL prices
    const llMatch = html.match(/100LL[\s\S]*?\$(\d+\.?\d*)\/Gal/i);
    if (llMatch) {
      prices.ll = parseFloat(llMatch[1]);
    }
    
    // Look for Jet-A prices  
    const jetMatch = html.match(/Jet-?A[\s\S]*?\$(\d+\.?\d*)\/Gal/i);
    if (jetMatch) {
      prices.jetA = parseFloat(jetMatch[1]);
    }
    
    // Also check for Self Service prices
    const selfMatch = html.match(/Self Service:.*?\$(\d+\.?\d*)\/Gal/i);
    if (selfMatch && !prices.ll) {
      prices.ll = parseFloat(selfMatch[1]);
    }
    
    // Full Service
    const fullMatch = html.match(/Full Service:.*?\$(\d+\.?\d*)\/Gal/i);
    if (fullMatch && !prices.ll) {
      prices.ll = parseFloat(fullMatch[1]);
    }
  } catch (e) {
    console.error(`Error parsing prices for ${icao}:`, e.message);
  }
  
  return prices;
}

// Main function
async function fetchFuelPrices() {
  console.log(`Fetching fuel prices for Michigan airports...`);
  console.log(`Total airports to check: ${MICHIGAN_AIRPORTS.length}`);
  
  const db = new sqlite3.Database(DB_PATH);
  
  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;
  
  for (const airport of MICHIGAN_AIRPORTS) {
    try {
      // Try 100LL.com first
      const url = `http://www.100ll.com/searchresults.php?searchfor=${airport.icao}`;
      console.log(`Fetching ${airport.icao} (${airport.city})...`);
      
      const html = await httpGet(url);
      const prices = parseFuelPrices(html, airport.icao);
      
      // Also try AirNav
      const airnavUrl = `https://www.airnav.com/fuel/${airport.icao}.html`;
      try {
        const airnavHtml = await httpGet(airnavUrl);
        const airnavPrices = parseFuelPrices(airnavHtml, airport.icao);
        // Prefer AirNav if it has data
        if (!prices.ll && airnavPrices.ll) prices.ll = airnavPrices.ll;
        if (!prices.jetA && airnavPrices.jetA) prices.jetA = airnavPrices.jetA;
      } catch (e) {
        // AirNav failed, continue with 100LL data
      }
      
      // Insert into database if we have any prices
      if (prices.ll || prices.jetA) {
        const price = prices.ll || prices.jetA;
        
        db.run(`
          INSERT OR REPLACE INTO airport_cache (icao, data_type, price, source_site, last_updated)
          VALUES (?, 'fuel', ?, '100ll.com', datetime('now'))
        `, [airport.icao, price], function(err) {
          if (err) {
            console.error(`Database error for ${airport.icao}:`, err.message);
          }
        });
        
        console.log(`  [OK] ${airport.icao}: $${price}/gal`);
        successCount++;
      } else {
        console.log(`  [--] ${airport.icao}: No price found`);
        skipCount++;
      }
      
      // Rate limiting - wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`  ✗ ${airport.icao}: Error - ${error.message}`);
      failCount++;
    }
  }
  
  db.close();
  
  console.log(`\n=== Summary ===`);
  console.log(`Successful: ${successCount}`);
  console.log(`No data: ${skipCount}`);
  console.log(`Failed: ${failCount}`);
}

// Run the script
fetchFuelPrices().catch(console.error);
