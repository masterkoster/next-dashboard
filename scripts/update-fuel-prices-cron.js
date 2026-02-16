/**
 * Cron job script to update fuel prices every 72 hours
 * Run this via Vercel Cron or a separate scheduler
 * 
 * Schedule: Every 72 hours
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'aviation_hub.db');

// Regional base prices (updated periodically)
const REGIONAL_BASE = {
  'IL': 6.15, 'IN': 5.95, 'MI': 6.25, 'OH': 5.85, 'WI': 5.95, 'MN': 6.05, 
  'IA': 5.75, 'MO': 5.65, 'KS': 5.55, 'NE': 5.65, 'SD': 5.75, 'ND': 5.85,
  'CT': 7.05, 'DE': 6.45, 'ME': 7.15, 'MD': 6.55, 'MA': 7.25, 'NH': 7.15, 
  'NJ': 6.85, 'NY': 6.95, 'PA': 6.45, 'RI': 7.05, 'VT': 7.25, 'VA': 6.15, 
  'WV': 5.95, 'DC': 6.85,
  'AL': 5.85, 'FL': 6.35, 'GA': 5.85, 'KY': 5.75, 'MS': 5.65, 'NC': 5.85, 
  'SC': 5.75, 'TN': 5.75, 'PR': 5.95, 'VI': 5.95,
  'AR': 5.65, 'LA': 5.75, 'NM': 6.15, 'OK': 5.55, 'TX': 5.75,
  'AZ': 6.25, 'CA': 7.45, 'HI': 8.25, 'NV': 6.85, 'AK': 9.15, 'GU': 7.95,
  'ID': 5.95, 'MT': 6.05, 'OR': 6.45, 'UT': 5.95, 'WA': 7.15, 'WY': 5.85,
};

const DEFAULT_BASE = 6.00;

// Get state code from ICAO
function getStateCode(icao) {
  const stateMap = {
    'AL': 'AL', 'AK': 'AK', 'AZ': 'AZ', 'AR': 'AR', 'CA': 'CA',
    'CO': 'CO', 'CT': 'CT', 'DE': 'DE', 'FL': 'FL', 'GA': 'GA',
    'HI': 'HI', 'ID': 'ID', 'IL': 'IL', 'IN': 'IN', 'IA': 'IA',
    'KS': 'KS', 'KY': 'KY', 'LA': 'LA', 'ME': 'ME', 'MD': 'MD',
    'MA': 'MA', 'MI': 'MI', 'MN': 'MN', 'MS': 'MS', 'MO': 'MO',
    'MT': 'MT', 'NE': 'NE', 'NV': 'NV', 'NH': 'NH', 'NJ': 'NJ',
    'NM': 'NM', 'NY': 'NY', 'NC': 'NC', 'ND': 'ND', 'OH': 'OH',
    'OK': 'OK', 'OR': 'OR', 'PA': 'PA', 'RI': 'RI', 'SC': 'SC',
    'SD': 'SD', 'TN': 'TN', 'TX': 'TX', 'UT': 'UT', 'VT': 'VT',
    'VA': 'VA', 'WA': 'WA', 'WV': 'WV', 'WI': 'WI', 'WY': 'WY',
    'DC': 'DC', 'PR': 'PR', 'VI': 'VI', 'GU': 'GU', 'AS': 'AS'
  };
  return stateMap[icao.substring(1, 3)];
}

function getNewPrice(icao) {
  const state = getStateCode(icao);
  const base = state ? (REGIONAL_BASE[state] || DEFAULT_BASE) : DEFAULT_BASE;
  // Small variance update (+/- 0.10 to simulate price changes)
  const change = (Math.random() * 0.20) - 0.10;
  return Math.round((base + change) * 100) / 100;
}

async function updateFuelPrices() {
  console.log('=== Starting 72-hour fuel price update ===\n');
  console.log(`Time: ${new Date().toISOString()}`);
  
  const db = new sqlite3.Database(DB_PATH);
  
  // Get all airports with cached fuel prices
  db.all("SELECT icao, price FROM airport_cache WHERE data_type = 'fuel'", [], (err, rows) => {
    if (err) {
      console.error('Error fetching cached prices:', err.message);
      db.close();
      process.exit(1);
    }
    
    console.log(`Found ${rows.length} cached fuel prices`);
    
    const updateStmt = db.prepare(`
      UPDATE airport_cache 
      SET price = ?, last_updated = datetime('now')
      WHERE icao = ? AND data_type = 'fuel'
    `);
    
    let updated = 0;
    rows.forEach(row => {
      const newPrice = getNewPrice(row.icao);
      updateStmt.run(newPrice, row.icao);
      updated++;
    });
    
    updateStmt.finalize(() => {
      // Log summary
      const now = new Date().toISOString();
      console.log(`\n=== Update Complete ===`);
      console.log(`Prices updated: ${updated}`);
      console.log(`Completed: ${now}`);
      
      // Record this update in a log
      console.log('\nNote: Next update scheduled in 72 hours');
      
      db.close();
      process.exit(0);
    });
  });
}

// Run if called directly
if (require.main === module) {
  updateFuelPrices();
}

module.exports = { updateFuelPrices };
