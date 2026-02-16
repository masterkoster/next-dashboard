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

// US Airports to scrape - Large, Medium, Small
const AIRPORTS = [
  // === LARGE AIRPORTS (Major hubs) ===
  { icao: 'KATL', name: 'Hartsfield-Jackson Atlanta', type: 'large' },
  { icao: 'KORD', name: "Chicago O'Hare", type: 'large' },
  { icao: 'KLAX', name: 'Los Angeles International', type: 'large' },
  { icao: 'KDFW', name: 'Dallas/Fort Worth', type: 'large' },
  { icao: 'KDEN', name: 'Denver International', type: 'large' },
  { icao: 'KJFK', name: 'John F Kennedy International', type: 'large' },
  { icao: 'KSFO', name: 'San Francisco International', type: 'large' },
  { icao: 'KLAS', name: 'Harry Reid (Las Vegas)', type: 'large' },
  { icao: 'KSEA', name: 'Seattle-Tacoma International', type: 'large' },
  { icao: 'KMIA', name: 'Miami International', type: 'large' },
  { icao: 'KFLL', name: 'Fort Lauderdale International', type: 'large' },
  { icao: 'KMCO', name: 'Orlando International', type: 'large' },
  { icao: 'KPHX', name: 'Phoenix Sky Harbor', type: 'large' },
  { icao: 'KIAH', name: 'George Bush Intercontinental', type: 'large' },
  { icao: 'KBOS', name: 'Boston Logan', type: 'large' },
  { icao: 'KMSP', name: 'Minneapolis-St Paul', type: 'large' },
  { icao: 'KCLT', name: 'Charlotte Douglas', type: 'large' },
  { icao: 'KDTW', name: 'Detroit Metropolitan', type: 'large' },
  { icao: 'KPHL', name: 'Philadelphia International', type: 'large' },
  { icao: 'KLGA', name: 'LaGuardia', type: 'large' },
  { icao: 'KEWR', name: 'Newark Liberty', type: 'large' },
  { icao: 'KBWI', name: 'Baltimore/Washington', type: 'large' },
  { icao: 'KDCA', name: 'Reagan National', type: 'large' },
  { icao: 'KIAD', name: 'Washington Dulles', type: 'large' },
  { icao: 'KSAN', name: 'San Diego International', type: 'large' },
  { icao: 'KDAL', name: 'Dallas Love Field', type: 'large' },
  { icao: 'KMDW', name: 'Chicago Midway', type: 'large' },
  { icao: 'KSLC', name: 'Salt Lake City', type: 'large' },
  { icao: 'KPDX', name: 'Portland International', type: 'large' },
  { icao: 'KSTL', name: 'St Louis Lambert', type: 'large' },
  { icao: 'KIND', name: 'Indianapolis International', type: 'large' },
  { icao: 'KCLE', name: 'Cleveland Hopkins', type: 'large' },
  { icao: 'KPIT', name: 'Pittsburgh International', type: 'large' },
  { icao: 'KMCI', name: 'Kansas City International', type: 'large' },
  { icao: 'KCVG', name: 'Cincinnati/Northern Kentucky', type: 'large' },
  { icao: 'KTPA', name: 'Tampa International', type: 'large' },
  { icao: 'KRSW', name: 'Southwest Florida International', type: 'large' },
  { icao: 'KJAX', name: 'Jacksonville International', type: 'large' },
  { icao: 'KMSY', name: 'New Orleans Louis Armstrong', type: 'large' },
  { icao: 'KABQ', name: 'Albuquerque International', type: 'large' },
  { icao: 'KOKC', name: 'Oklahoma Will Rogers', type: 'large' },
  { icao: 'KTUL', name: 'Tulsa International', type: 'large' },
  { icao: 'KLIT', name: 'Little Rock', type: 'large' },
  { icao: 'KMEM', name: 'Memphis International', type: 'large' },
  { icao: 'KBHM', name: 'Birmingham-Shuttlesworth', type: 'large' },
  { icao: 'KRIC', name: 'Richmond International', type: 'large' },
  { icao: 'KORF', name: 'Norfolk International', type: 'large' },
  { icao: 'KRDU', name: 'Raleigh-Durham International', type: 'large' },
  { icao: 'KCLT', name: 'Charlotte Douglas', type: 'large' },
  { icao: 'KGSO', name: 'Piedmont Triad', type: 'large' },
  { icao: 'KCMH', name: 'John Glenn Columbus', type: 'large' },
  { icao: 'KDAY', name: 'Dayton International', type: 'large' },
  
  // === MEDIUM AIRPORTS (Regional hubs) ===
  { icao: 'KGRR', name: 'Gerald R Ford International', type: 'medium' },
  { icao: 'KFNT', name: 'Bishop International', type: 'medium' },
  { icao: 'KLAN', name: 'Capital Region International', type: 'medium' },
  { icao: 'KTVC', name: 'Cherry Capital', type: 'medium' },
  { icao: 'KMBS', name: 'MBS International', type: 'medium' },
  { icao: 'KSAW', name: 'Marquette/Sawyer', type: 'medium' },
  { icao: 'KCIU', name: 'Chippewa County International', type: 'medium' },
  { icao: 'KAZO', name: 'Kalamazoo/Battle Creek', type: 'medium' },
  { icao: 'KBTL', name: 'Battle Creek Executive', type: 'medium' },
  { icao: 'KESC', name: 'Delta County', type: 'medium' },
  { icao: 'KCMX', name: 'Houghton County Memorial', type: 'medium' },
  { icao: 'KJXN', name: 'Jackson County', type: 'medium' },
  { icao: 'KMKG', name: 'Muskegon County', type: 'medium' },
  { icao: 'KPTK', name: 'Oakland County International', type: 'medium' },
  { icao: 'KPLN', name: 'Pellston Regional', type: 'medium' },
  { icao: 'KDET', name: 'Coleman A Young Municipal', type: 'medium' },
  { icao: 'KAPN', name: 'Alpena County Regional', type: 'medium' },
  { icao: 'KBEH', name: 'Southwest Michigan Regional', type: 'medium' },
  { icao: 'KTTF', name: 'Monroe Custer', type: 'medium' },
  { icao: 'K3RM', name: 'St Marys', type: 'medium' },
  // Ohio
  { icao: 'KCAK', name: 'Akron-Canton Regional', type: 'medium' },
  { icao: 'KLCK', name: 'Rickenbacker International', type: 'medium' },
  { icao: 'KMFD', name: 'Mansfield Lahm Regional', type: 'medium' },
  { icao: 'KMNG', name: 'Mount Pleasant Muni', type: 'medium' },
  { icao: 'KHAK', name: 'Hooks Field', type: 'medium' },
  // Wisconsin
  { icao: 'KMSN', name: 'Madison Dane County', type: 'medium' },
  { icao: 'KMKE', name: 'Milwaukee Mitchell', type: 'medium' },
  { icao: 'KGRB', name: 'Green Bay Austin Straubel', type: 'medium' },
  { icao: 'KOSH', name: 'Oshkosh Wittman Regional', type: 'medium' },
  { icao: 'KEAU', name: 'Chippewa Valley Regional', type: 'medium' },
  // Indiana
  { icao: 'KSBN', name: 'South Bend International', type: 'medium' },
  { icao: 'KLAF', name: 'Purdue University', type: 'medium' },
  { icao: 'KBMG', name: 'Bloomington Municipal', type: 'medium' },
  { icao: 'KGEZ', name: 'Seymour Johnson', type: 'medium' },
  // Illinois
  { icao: 'KMLI', name: 'Quad Cities International', type: 'medium' },
  { icao: 'KBMI', name: 'Central Illinois Regional', type: 'medium' },
  { icao: 'KTIP', name: 'Rantoul National Aviation', type: 'medium' },
  // Colorado
  { icao: 'KEGE', name: 'Eagle County Regional', type: 'medium' },
  { icao: 'KASE', name: 'Aspen Pitkin County', type: 'medium' },
  { icao: 'KPUB', name: 'Pueblo Memorial', type: 'medium' },
  // Texas
  { icao: 'KHOU', name: 'William P Hobby', type: 'medium' },
  { icao: 'KSAT', name: 'San Antonio International', type: 'medium' },
  { icao: 'KAUS', name: 'Austin-Bergstrom', type: 'medium' },
  { icao: 'KCRP', name: 'Corpus Christi International', type: 'medium' },
  { icao: 'KLFK', name: 'Lufkin Angelina County', type: 'medium' },
  // California
  { icao: 'KSNA', name: 'John Wayne Orange County', type: 'medium' },
  { icao: 'KBUR', name: 'Hollywood Burbank', type: 'medium' },
  { icao: 'KSJC', name: 'Norman Y Mineta San Jose', type: 'medium' },
  { icao: 'KOAK', name: 'Oakland International', type: 'medium' },
  { icao: 'KSMF', name: 'Sacramento International', type: 'medium' },
  { icao: 'KONT', name: 'Ontario International', type: 'medium' },
  { icao: 'KPSP', name: 'Palm Springs International', type: 'medium' },
  { icao: 'KFAT', name: 'Fresno Yosemite International', type: 'medium' },
  // Florida
  { icao: 'KPBI', name: 'Palm Beach International', type: 'medium' },
  { icao: 'KTLH', name: 'Tallahassee International', type: 'medium' },
  { icao: 'KGNV', name: 'Gainesville Regional', type: 'medium' },
  { icao: 'KECP', name: 'Northwest Florida Beaches', type: 'medium' },
  // Georgia
  { icao: 'KSAV', name: 'Savannah/Hilton Head International', type: 'medium' },
  { icao: 'KABY', name: 'Southwest Georgia Regional', type: 'medium' },
  { icao: 'KAGS', name: 'Augusta Regional', type: 'medium' },
  { icao: 'KMCN', name: 'Middle Georgia Regional', type: 'medium' },
  // North Carolina
  { icao: 'KFAY', name: 'Fayetteville Regional', type: 'medium' },
  { icao: 'KILM', name: 'Wilmington International', type: 'medium' },
  { icao: 'KCLT', name: 'Charlotte Douglas', type: 'medium' },
  // Virginia
  { icao: 'KDCA', name: 'Reagan National', type: 'medium' },
  { icao: 'KCHO', name: 'Charlottesville-Albemarle', type: 'medium' },
  { icao: 'KLYH', name: 'Lynchburg Regional', type: 'medium' },
  // Pennsylvania
  { icao: 'KMDT', name: 'Harrisburg International', type: 'medium' },
  { icao: 'KAVP', name: 'Wilkes-Barre Scranton', type: 'medium' },
  { icao: 'KUNV', name: 'University Park', type: 'medium' },
  // New York
  { icao: 'KBUF', name: 'Buffalo Niagara International', type: 'medium' },
  { icao: 'KROC', name: 'Greater Rochester International', type: 'medium' },
  { icao: 'KSYR', name: 'Syracuse Hancock International', type: 'medium' },
  { icao: 'KALB', name: 'Albany International', type: 'medium' },
  { icao: 'KIAG', name: 'Niagara Falls International', type: 'medium' },
  // New Jersey
  { icao: 'KACY', name: 'Atlantic City International', type: 'medium' },
  { icao: 'KMMU', name: 'Morristown Municipal', type: 'medium' },
  { icao: 'KTEB', name: 'Teterboro', type: 'medium' },
  // Connecticut
  { icao: 'KBDL', name: 'Bradley International', type: 'medium' },
  { icao: 'KDXR', name: 'Danbury Municipal', type: 'medium' },
  // Massachusetts
  { icao: 'KACK', name: 'Nantucket Memorial', type: 'medium' },
  { icao: 'KEWB', name: 'New Bedford Regional', type: 'medium' },
  { icao: 'KHYA', name: 'Barnstable Municipal', type: 'medium' },
  // Arizona
  { icao: 'KTUS', name: 'Tucson International', type: 'medium' },
  { icao: 'KFLG', name: 'Flagstaff Pulliam', type: 'medium' },
  { icao: 'KYUM', name: 'Yuma International', type: 'medium' },
  
  // === SMALL AIRPORTS (GA fields with fuel) ===
  // Michigan
  { icao: 'KIMT', name: 'Ford Airport', type: 'small' },
  { icao: 'KYIP', name: 'Willow Run', type: 'small' },
  { icao: 'KMTC', name: 'Selfridge ANG', type: 'small' },
  { icao: 'KADG', name: 'Lenawee County', type: 'small' },
  { icao: 'KAMN', name: 'Alma Municipal', type: 'small' },
  { icao: 'KBAX', name: 'Hancock County', type: 'small' },
  { icao: 'KCAD', name: 'Mackinac County', type: 'small' },
  { icao: 'KCIU', name: 'Chippewa County', type: 'small' },
  { icao: 'KDUP', name: 'Drummond Island', type: 'small' },
  { icao: 'KERY', name: ' Luce County', type: 'small' },
  { icao: 'KGPZ', name: 'Grand Rapids', type: 'small' },
  { icao: 'KHAI', name: 'Three Rivers', type: 'small' },
  { icao: 'KJXN', name: 'Jackson', type: 'small' },
  { icao: 'KLWA', name: 'Southwest Michigan Regional', type: 'small' },
  { icao: 'KMBL', name: 'Manistee County', type: 'small' },
  { icao: 'KMGN', name: 'Muskegon County', type: 'small' },
  { icao: 'KMPU', name: 'Mackinaw City', type: 'small' },
  { icao: 'KOEB', name: 'Branch County', type: 'small' },
  { icao: 'KOSC', name: 'Oscoda County', type: 'small' },
  { icao: 'KP58', name: 'St Clair County', type: 'small' },
  // Ohio
  { icao: 'KOSU', name: 'Ohio State University', type: 'small' },
  { icao: 'KHAO', name: 'Butler County', type: 'small' },
  { icao: 'KVGT', name: 'North Las Vegas', type: 'small' },
  { icao: 'KMIF', name: 'Middletown Regional', type: 'small' },
  { icao: 'KAXV', name: 'Andrews University', type: 'small' },
  { icao: 'KVTA', name: 'Newark-Heath', type: 'small' },
  { icao: 'KBKF', name: 'Burlington', type: 'small' },
  { icao: 'KMGY', name: 'Dayton-Wright Brothers', type: 'small' },
  // Wisconsin  
  { icao: 'KRYV', name: 'Dodge County', type: 'small' },
  { icao: 'KUES', name: 'Waukesha County', type: 'small' },
  { icao: 'KATW', name: 'Outagamie County', type: 'small' },
  { icao: 'KC89', name: 'Steven Pleasant', type: 'small' },
  { icao: 'KMWC', name: 'Lawrence J Timmerman', type: 'small' },
  // Indiana
  { icao: 'KHUF', name: 'Terra Haute Regional', type: 'small' },
  { icao: 'KASX', name: 'John F Kennedy Memorial', type: 'small' },
  { icao: 'KBMG', name: 'Monroe County', type: 'small' },
  { icao: 'KCEV', name: 'Mettel Field', type: 'small' },
  // Colorado
  { icao: 'KBJC', name: 'Rocky Mountain Metro', type: 'small' },
  { icao: 'KBDU', name: 'Boulder Municipal', type: 'small' },
  { icao: 'KAEJ', name: 'Buena Vista Municipal', type: 'small' },
  { icao: 'KCAG', name: 'Craig-Moffat', type: 'small' },
  // Utah
  { icao: 'KHIF', name: 'Hill AFB', type: 'small' },
  { icao: 'KPVU', name: 'Provo Municipal', type: 'small' },
  // Texas
  { icao: 'KDAL', name: 'Dallas Love Field', type: 'small' },
  { icao: 'KHOU', name: 'William P Hobby', type: 'small' },
  { icao: 'KGRK', name: 'Killeen-Fort Hood Regional', type: 'small' },
  { icao: 'KTKI', name: 'McKinney National', type: 'small' },
  { icao: 'KAFW', name: 'Fort Worth Alliance', type: 'small' },
  // California
  { icao: 'KVNY', name: 'Van Nuys', type: 'small' },
  { icao: 'KHWD', name: 'Hayward Executive', type: 'small' },
  { icao: 'KPAO', name: 'Palo Alto Airport', type: 'small' },
  { icao: 'KSQL', name: 'San Carlos Airport', type: 'small' },
  { icao: 'KACV', name: 'Arcata Airport', type: 'small' },
  { icao: 'KSCK', name: 'Stockton Metropolitan', type: 'small' },
  { icao: 'KSMF', name: 'Sacramento Executive', type: 'small' },
  { icao: 'KRNM', name: 'Ramona Airport', type: 'small' },
  { icao: 'KCRQ', name: 'McClellan-Palomar', type: 'small' },
  // Florida
  { icao: 'KVRB', name: 'Vero Beach Regional', type: 'small' },
  { icao: 'KFXE', name: 'Fort Lauderdale Executive', type: 'small' },
  { icao: 'KTMB', name: 'Miami-Opa Locka', type: 'small' },
  { icao: 'KOBE', name: 'Okeechobee County', type: 'small' },
  { icao: 'KPMP', name: 'Pompano Beach Airpark', type: 'small' },
  { icao: 'KBCT', name: 'Boca Raton', type: 'small' },
  // Georgia
  { icao: 'KFTY', name: 'Fulton County', type: 'small' },
  { icao: 'KPDK', name: 'DeKalb-Peachtree', type: 'small' },
  { icao: 'KMCN', name: 'Middle Georgia Regional', type: 'small' },
  { icao: 'KAHN', name: 'Athens-Ben Epps', type: 'small' },
  // North Carolina
  { icao: 'KINT', name: 'Smith Reynolds', type: 'small' },
  { icao: 'KASJ', name: 'Asheville Regional', type: 'small' },
  { icao: 'KSOP', name: 'Moore County', type: 'small' },
  // Pennsylvania
  { icao: 'KCXY', name: 'Capital City', type: 'small' },
  { icao: 'KLNS', name: 'Lancaster', type: 'small' },
  { icao: 'KFKL', name: 'Franklin', type: 'small' },
  // New York
  { icao: 'KHPN', name: 'Westchester County', type: 'small' },
  { icao: 'KFRG', name: 'Republic Airport', type: 'small' },
  { icao: 'KSWF', name: 'Newburgh-Stewart', type: 'small' },
  { icao: 'KELM', name: 'Elmira-Corning Regional', type: 'small' },
  // Connecticut
  { icao: 'KHVN', name: 'Tweed-New Haven', type: 'small' },
  // Massachusetts
  { icao: 'KBED', name: 'Hanscom Field', type: 'small' },
  { icao: 'KMVY', name: "Martha's Vineyard", type: 'small' },
  { icao: 'KPYM', name: 'Plymouth Municipal', type: 'small' },
  // Alaska
  { icao: 'PANC', name: 'Ted Stevens Anchorage', type: 'medium' },
  { icao: 'PAFA', name: 'Fairbanks International', type: 'medium' },
  { icao: 'PAJN', name: 'Juneau International', type: 'medium' },
  { icao: 'PAKT', name: 'Ketchikan International', type: 'medium' },
  // Hawaii
  { icao: 'PHNL', name: 'Daniel K Inouye Honolulu', type: 'medium' },
  { icao: 'PHKO', name: 'Kona International', type: 'medium' },
  { icao: 'PHOG', name: 'Kahului Airport', type: 'medium' },
  { icao: 'PHLI', name: 'Lihue Airport', type: 'medium' },
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
