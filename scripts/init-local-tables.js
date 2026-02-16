/**
 * Initialize SQLite tables for weather cache and weight & balance
 * Run: node scripts/init-local-tables.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'aviation_hub.db');

const db = new sqlite3.Database(DB_PATH);

console.log('Initializing local SQLite tables...\n');

// Weather Cache Table
db.run(`
  CREATE TABLE IF NOT EXISTS weather_cache (
    id TEXT PRIMARY KEY,
    region TEXT NOT NULL,
    icao TEXT,
    data_type TEXT NOT NULL,
    data TEXT NOT NULL,
    fetched_at TEXT DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT,
    UNIQUE(region, icao, data_type)
  )
`, (err) => {
  if (err) console.error('Error creating weather_cache:', err);
  else console.log('✓ weather_cache table created');
});

// Weight & Balance Table
db.run(`
  CREATE TABLE IF NOT EXISTS weight_balance (
    id TEXT PRIMARY KEY,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    empty_weight REAL NOT NULL,
    empty_cg REAL NOT NULL,
    max_weight REAL NOT NULL,
    arm_pilot REAL NOT NULL,
    arm_passenger REAL NOT NULL,
    arm_baggage REAL NOT NULL,
    arm_fuel REAL NOT NULL,
    fuel_capacity REAL NOT NULL,
    cruise_speed INTEGER NOT NULL,
    fuel_burn REAL NOT NULL,
    unusable_fuel REAL DEFAULT 2,
    is_verified INTEGER DEFAULT 0,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(make, model)
  )
`, (err) => {
  if (err) console.error('Error creating weight_balance:', err);
  else console.log('✓ weight_balance table created');
});

// Create index for faster weather lookups
db.run(`
  CREATE INDEX IF NOT EXISTS idx_weather_region_icao 
  ON weather_cache(region, icao)
`, (err) => {
  if (err) console.error('Error creating index:', err);
  else console.log('✓ weather_cache index created');
});

// User Preferences Table (for performance settings, etc)
db.run(`
  CREATE TABLE IF NOT EXISTS user_preferences (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, key)
  )
`, (err) => {
  if (err) console.error('Error creating user_preferences:', err);
  else console.log('✓ user_preferences table created');
});

// Flight Recordings Table (local cache for track data)
db.run(`
  CREATE TABLE IF NOT EXISTS flight_recordings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    aircraft_id TEXT,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    import_date TEXT DEFAULT CURRENT_TIMESTAMP,
    flight_date TEXT,
    departure_icao TEXT,
    arrival_icao TEXT,
    duration_minutes INTEGER,
    track_data TEXT NOT NULL,
    notes TEXT,
    cloudahoy_url TEXT,
    UNIQUE(id)
  )
`, (err) => {
  if (err) console.error('Error creating flight_recordings:', err);
  else console.log('✓ flight_recordings table created');
});

db.close(() => {
  console.log('\n✅ All SQLite tables initialized successfully!');
});
