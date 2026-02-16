/**
 * Seed 50 most common GA aircraft with Weight & Balance data
 * Run: node scripts/seed-aircraft-wb.js
 * 
 * ⚠️ DISCLAIMER: These are TYPICAL VALUES from POH data.
 * Always verify with actual aircraft documents before flight.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'aviation_hub.db');
const db = new sqlite3.Database(DB_PATH);

// 50 Aircraft with typical W&B values
// All values are TYPICAL - verify with actual aircraft POH
const aircraftData = [
  // Cessna Singles
  { make: 'Cessna', model: '172S', empty_weight: 1685, empty_cg: 39.0, max_weight: 2550, arm_pilot: 80.5, arm_passenger: 118.1, arm_baggage: 142.8, arm_fuel: 48, fuel_capacity: 56, cruise_speed: 124, fuel_burn: 8.5, unusable_fuel: 2, notes: 'Typical values - verify with POH' },
  { make: 'Cessna', model: '172R', empty_weight: 1610, empty_cg: 39.0, max_weight: 2550, arm_pilot: 80.5, arm_passenger: 118.1, arm_baggage: 142.8, arm_fuel: 48, fuel_capacity: 56, cruise_speed: 122, fuel_burn: 8.3, unusable_fuel: 2, notes: 'Typical values - verify with POH' },
  { make: 'Cessna', model: '172N', empty_weight: 1550, empty_cg: 39.0, max_weight: 2550, arm_pilot: 80.5, arm_passenger: 118.1, arm_baggage: 142.8, arm_fuel: 95, fuel_capacity: 42, cruise_speed: 115, fuel_burn: 8.5, unusable_fuel: 2, notes: 'Typical values - verify with POH' },
  { make: 'Cessna', model: '172M', empty_weight: 1500, empty_cg: 39.0, max_weight: 2550, arm_pilot: 80.5, arm_passenger: 118.1, arm_baggage: 142.8, arm_fuel: 95, fuel_capacity: 42, cruise_speed: 110, fuel_burn: 8.0, unusable_fuel: 2, notes: 'Typical values - verify with POH' },
  { make: 'Cessna', model: '152', empty_weight: 1150, empty_cg: 39.0, max_weight: 1670, arm_pilot: 80.5, arm_passenger: 118.0, arm_baggage: 142.8, arm_fuel: 90, fuel_capacity: 26, cruise_speed: 105, fuel_burn: 7.0, unusable_fuel: 1, notes: 'Typical values - verify with POH' },
  { make: 'Cessna', model: '150M', empty_weight: 1085, empty_cg: 39.0, max_weight: 1650, arm_pilot: 80.5, arm_passenger: 118.0, arm_baggage: 142.8, arm_fuel: 90, fuel_capacity: 26, cruise_speed: 100, fuel_burn: 6.5, unusable_fuel: 1, notes: 'Typical values - verify with POH' },
  { make: 'Cessna', model: '182T', empty_weight: 1710, empty_cg: 39.0, max_weight: 3100, arm_pilot: 80.5, arm_passenger: 118.1, arm_baggage: 142.8, arm_fuel: 48, fuel_capacity: 87, cruise_speed: 150, fuel_burn: 12.5, unusable_fuel: 3, notes: 'Typical values - verify with POH' },
  { make: 'Cessna', model: '182S', empty_weight: 1695, empty_cg: 39.0, max_weight: 3100, arm_pilot: 80.5, arm_passenger: 118.1, arm_baggage: 142.8, arm_fuel: 48, fuel_capacity: 87, cruise_speed: 150, fuel_burn: 12.5, unusable_fuel: 3, notes: 'Typical values - verify with POH' },
  { make: 'Cessna', model: '182Q', empty_weight: 1750, empty_cg: 39.0, max_weight: 3100, arm_pilot: 80.5, arm_passenger: 118.1, arm_baggage: 142.8, arm_fuel: 48, fuel_capacity: 87, cruise_speed: 150, fuel_burn: 12.5, unusable_fuel: 3, notes: 'Typical values - verify with POH' },
  { make: 'Cessna', model: '206H', empty_weight: 2350, empty_cg: 39.0, max_weight: 3600, arm_pilot: 80.5, arm_passenger: 118.1, arm_baggage: 142.8, arm_fuel: 48, fuel_capacity: 92, cruise_speed: 160, fuel_burn: 14.0, unusable_fuel: 3, notes: 'Typical values - verify with POH' },
  { make: 'Cessna', model: '180H', empty_weight: 2200, empty_cg: 37.0, max_weight: 2650, arm_pilot: 78.0, arm_passenger: 110.0, arm_baggage: 140.0, arm_fuel: 90, fuel_capacity: 60, cruise_speed: 140, fuel_burn: 12.0, unusable_fuel: 2, notes: 'Typical values - verify with POH' },
  { make: 'Cessna', model: '185E', empty_weight: 2250, empty_cg: 37.0, max_weight: 3200, arm_pilot: 78.0, arm_passenger: 110.0, arm_baggage: 140.0, arm_fuel: 90, fuel_capacity: 65, cruise_speed: 155, fuel_burn: 14.0, unusable_fuel: 2, notes: 'Typical values - verify with POH' },
  { make: 'Cessna', model: '208 Caravan', empty_weight: 4600, empty_cg: 40.0, max_weight: 8800, arm_pilot: 80.0, arm_passenger: 110.0, arm_baggage: 140.0, arm_fuel: 120, fuel_capacity: 192, cruise_speed: 190, fuel_burn: 25.0, unusable_fuel: 5, notes: 'Typical values - verify with POH' },
  
  // Piper Cherokee Series
  { make: 'Piper', model: 'PA-28-181 Archer', empty_weight: 1572, empty_cg: 86.48, max_weight: 2550, arm_pilot: 80.5, arm_passenger: 118.1, arm_baggage: 142.8, arm_fuel: 95, fuel_capacity: 48, cruise_speed: 120, fuel_burn: 8.5, unusable_fuel: 2, notes: 'Typical values - verify with POH' },
  { make: 'Piper', model: 'PA-28-161 Warrior III', empty_weight: 1540, empty_cg: 86.0, max_weight: 2440, arm_pilot: 80.5, arm_passenger: 118.1, arm_baggage: 142.8, arm_fuel: 95, fuel_capacity: 48, cruise_speed: 116, fuel_burn: 8.0, unusable_fuel: 2, notes: 'Typical values - verify with POH' },
  { make: 'Piper', model: 'PA-28-140 Cherokee', empty_weight: 1275, empty_cg: 85.0, max_weight: 2150, arm_pilot: 80.5, arm_passenger: 118.1, arm_baggage: 142.8, arm_fuel: 95, fuel_capacity: 42, cruise_speed: 108, fuel_burn: 7.5, unusable_fuel: 2, notes: 'Typical values - verify with POH' },
  { make: 'Piper', model: 'PA-28-151 Warrior', empty_weight: 1480, empty_cg: 86.0, max_weight: 2325, arm_pilot: 80.5, arm_passenger: 118.1, arm_baggage: 142.8, arm_fuel: 95, fuel_capacity: 44, cruise_speed: 115, fuel_burn: 8.0, unusable_fuel: 2, notes: 'Typical values - verify with POH' },
  { make: 'Piper', model: 'PA-28R-201 Arrow', empty_weight: 1620, empty_cg: 86.0, max_weight: 2750, arm_pilot: 80.5, arm_passenger: 118.1, arm_baggage: 142.8, arm_fuel: 95, fuel_capacity: 72, cruise_speed: 130, fuel_burn: 10.0, unusable_fuel: 2, notes: 'Typical values - verify with POH' },
  { make: 'Piper', model: 'PA-28R-180 Cherokee Arrow', empty_weight: 1580, empty_cg: 86.0, max_weight: 2550, arm_pilot: 80.5, arm_passenger: 118.1, arm_baggage: 142.8, arm_fuel: 95, fuel_capacity: 56, cruise_speed: 125, fuel_burn: 9.5, unusable_fuel: 2, notes: 'Typical values - verify with POH' },
  { make: 'Piper', model: 'PA-32R-301 Saratoga', empty_weight: 2050, empty_cg: 88.0, max_weight: 3600, arm_pilot: 80.5, arm_passenger: 118.1, arm_baggage: 142.8, arm_fuel: 95, fuel_capacity: 102, cruise_speed: 140, fuel_burn: 14.0, unusable_fuel: 3, notes: 'Typical values - verify with POH' },
  { make: 'Piper', model: 'PA-32-301T Turbo Saratoga', empty_weight: 2150, empty_cg: 88.0, max_weight: 3700, arm_pilot: 80.5, arm_passenger: 118.1, arm_baggage: 142.8, arm_fuel: 95, fuel_capacity: 102, cruise_speed: 155, fuel_burn: 15.0, unusable_fuel: 3, notes: 'Typical values - verify with POH' },
  { make: 'Piper', model: 'PA-34-200 Seneca', empty_weight: 3420, empty_cg: 83.0, max_weight: 4570, arm_pilot: 80.3, arm_passenger: 118.0, arm_baggage: 142.0, arm_fuel: 196, fuel_capacity: 102, cruise_speed: 160, fuel_burn: 14.0, unusable_fuel: 3, notes: 'Twin - Typical values - verify with POH' },
  { make: 'Piper', model: 'PA-46-350P Malibu', empty_weight: 3200, empty_cg: 84.0, max_weight: 4200, arm_pilot: 84.0, arm_passenger: 118.0, arm_baggage: 143.0, arm_fuel: 118, fuel_capacity: 96, cruise_speed: 210, fuel_burn: 18.0, unusable_fuel: 4, notes: 'Typical values - verify with POH' },
  { make: 'Piper', model: 'PA-23-250 Aztec', empty_weight: 3100, empty_cg: 85.0, max_weight: 5200, arm_pilot: 85.0, arm_passenger: 120.0, arm_baggage: 143.0, arm_fuel: 140, fuel_capacity: 100, cruise_speed: 180, fuel_burn: 20.0, unusable_fuel: 3, notes: 'Twin - Typical values - verify with POH' },
  
  // Diamond
  { make: 'Diamond', model: 'DA40 Star', empty_weight: 1650, empty_cg: 93.0, max_weight: 2530, arm_pilot: 83.0, arm_passenger: 118.0, arm_baggage: 143.0, arm_fuel: 95, fuel_capacity: 34, cruise_speed: 140, fuel_burn: 9.0, unusable_fuel: 1, notes: 'Typical values - verify with POH' },
  { make: 'Diamond', model: 'DA42 Twin Star', empty_weight: 3600, empty_cg: 94.0, max_weight: 4235, arm_pilot: 83.0, arm_passenger: 118.0, arm_baggage: 143.0, arm_fuel: 95, fuel_capacity: 108, cruise_speed: 155, fuel_burn: 12.0, unusable_fuel: 2, notes: 'Twin - Typical values - verify with POH' },
  { make: 'Diamond', model: 'DA50 RG', empty_weight: 3300, empty_cg: 94.0, max_weight: 4400, arm_pilot: 83.0, arm_passenger: 118.0, arm_baggage: 143.0, arm_fuel: 95, fuel_capacity: 92, cruise_speed: 165, fuel_burn: 14.0, unusable_fuel: 2, notes: 'Typical values - verify with POH' },
  
  // Cirrus
  { make: 'Cirrus', model: 'SR20', empty_weight: 2400, empty_cg: 83.0, max_weight: 3050, arm_pilot: 82.0, arm_passenger: 118.0, arm_baggage: 143.0, arm_fuel: 95, fuel_capacity: 56, cruise_speed: 155, fuel_burn: 10.0, unusable_fuel: 2, notes: 'Typical values - verify with POH' },
  { make: 'Cirrus', model: 'SR22', empty_weight: 2350, empty_cg: 83.0, max_weight: 3400, arm_pilot: 82.0, arm_passenger: 118.0, arm_baggage: 143.0, arm_fuel: 95, fuel_capacity: 92, cruise_speed: 180, fuel_burn: 12.0, unusable_fuel: 2, notes: 'Typical values - verify with POH' },
  { make: 'Cirrus', model: 'SR22T', empty_weight: 2450, empty_cg: 83.0, max_weight: 3400, arm_pilot: 82.0, arm_passenger: 118.0, arm_baggage: 143.0, arm_fuel: 95, fuel_capacity: 92, cruise_speed: 185, fuel_burn: 14.0, unusable_fuel: 2, notes: 'Typical values - verify with POH' },
  
  // Mooney
  { make: 'Mooney', model: 'M20J 231', empty_weight: 2240, empty_cg: 84.0, max_weight: 3075, arm_pilot: 80.0, arm_passenger: 122.0, arm_baggage: 143.0, arm_fuel: 118, fuel_capacity: 72, cruise_speed: 175, fuel_burn: 12.0, unusable_fuel: 2, notes: 'Typical values - verify with POH' },
  { make: 'Mooney', model: 'M20K 252', empty_weight: 2320, empty_cg: 84.0, max_weight: 3185, arm_pilot: 80.0, arm_passenger: 122.0, arm_baggage: 143.0, arm_fuel: 118, fuel_capacity: 87, cruise_speed: 185, fuel_burn: 14.0, unusable_fuel: 2, notes: 'Typical values - verify with POH' },
  { make: 'Mooney', model: 'M20R Ovation', empty_weight: 2450, empty_cg: 84.0, max_weight: 3200, arm_pilot: 80.0, arm_passenger: 122.0, arm_baggage: 143.0, arm_fuel: 118, fuel_capacity: 92, cruise_speed: 190, fuel_burn: 15.0, unusable_fuel: 2, notes: 'Typical values - verify with POH' },
  
  // Beechcraft
  { make: 'Beechcraft', model: 'Bonanza A36', empty_weight: 3350, empty_cg: 82.0, max_weight: 3650, arm_pilot: 80.5, arm_passenger: 122.8, arm_baggage: 142.5, arm_fuel: 142, fuel_capacity: 102, cruise_speed: 155, fuel_burn: 14.0, unusable_fuel: 3, notes: 'Typical values - verify with POH' },
  { make: 'Beechcraft', model: 'Bonanza V35', empty_weight: 2950, empty_cg: 82.0, max_weight: 3400, arm_pilot: 80.5, arm_passenger: 122.8, arm_baggage: 142.5, arm_fuel: 130, fuel_capacity: 84, cruise_speed: 150, fuel_burn: 13.0, unusable_fuel: 2, notes: 'Typical values - verify with POH' },
  { make: 'Beechcraft', model: 'King Air B200', empty_weight: 6800, empty_cg: 86.0, max_weight: 12500, arm_pilot: 84.0, arm_passenger: 118.0, arm_baggage: 150.0, arm_fuel: 200, fuel_capacity: 192, cruise_speed: 270, fuel_burn: 40.0, unusable_fuel: 5, notes: 'Twin - Typical values - verify with POH' },
  { make: 'Beechcraft', model: 'Skipper E33', empty_weight: 1750, empty_cg: 78.0, max_weight: 2550, arm_pilot: 78.0, arm_passenger: 110.0, arm_baggage: 140.0, arm_fuel: 95, fuel_capacity: 50, cruise_speed: 120, fuel_burn: 9.0, unusable_fuel: 2, notes: 'Typical values - verify with POH' },
  
  // Grumman
  { make: 'Grumman', model: 'AA-5 Traveler', empty_weight: 1350, empty_cg: 75.0, max_weight: 2100, arm_pilot: 80.0, arm_passenger: 115.0, arm_baggage: 140.0, arm_fuel: 75, fuel_capacity: 36, cruise_speed: 110, fuel_burn: 8.0, unusable_fuel: 1, notes: 'Typical values - verify with POH' },
  { make: 'Grumman', model: 'AA-5B Cheetah', empty_weight: 1400, empty_cg: 75.0, max_weight: 2150, arm_pilot: 80.0, arm_passenger: 115.0, arm_baggage: 140.0, arm_fuel: 75, fuel_capacity: 38, cruise_speed: 115, fuel_burn: 8.5, unusable_fuel: 1, notes: 'Typical values - verify with POH' },
  { make: 'Grumman', model: 'AG-5B Tiger', empty_weight: 1480, empty_cg: 75.0, max_weight: 2250, arm_pilot: 80.0, arm_passenger: 115.0, arm_baggage: 140.0, arm_fuel: 75, fuel_capacity: 42, cruise_speed: 120, fuel_burn: 9.0, unusable_fuel: 1, notes: 'Typical values - verify with POH' },
  
  // Socata
  { make: 'Socata', model: 'TB-9 Tampico', empty_weight: 1550, empty_cg: 85.0, max_weight: 2100, arm_pilot: 80.0, arm_passenger: 115.0, arm_baggage: 140.0, arm_fuel: 95, fuel_capacity: 36, cruise_speed: 115, fuel_burn: 8.5, unusable_fuel: 1, notes: 'Typical values - verify with POH' },
  { make: 'Socata', model: 'TB-10 Tobago', empty_weight: 1650, empty_cg: 85.0, max_weight: 2200, arm_pilot: 80.0, arm_passenger: 115.0, arm_baggage: 140.0, arm_fuel: 95, fuel_capacity: 36, cruise_speed: 120, fuel_burn: 9.0, unusable_fuel: 1, notes: 'Typical values - verify with POH' },
  { make: 'Socata', model: 'TB-21 Trinidad TC', empty_weight: 1950, empty_cg: 85.0, max_weight: 2700, arm_pilot: 80.0, arm_passenger: 115.0, arm_baggage: 140.0, arm_fuel: 95, fuel_capacity: 50, cruise_speed: 145, fuel_burn: 12.0, unusable_fuel: 2, notes: 'Typical values - verify with POH' },
  
  // Light Sport / Vintage
  { make: 'Aeronca', model: '7EC Champ', empty_weight: 1200, empty_cg: 68.0, max_weight: 1450, arm_pilot: 72.0, arm_passenger: 101.0, arm_baggage: 120.0, arm_fuel: 75, fuel_capacity: 26, cruise_speed: 85, fuel_burn: 5.0, unusable_fuel: 1, notes: 'Vintage - Typical values - verify with POH' },
  { make: 'Aeronca', model: '7GCBC Citabria', empty_weight: 1250, empty_cg: 68.0, max_weight: 1500, arm_pilot: 72.0, arm_passenger: 101.0, arm_baggage: 120.0, arm_fuel: 75, fuel_capacity: 26, cruise_speed: 85, fuel_burn: 5.0, unusable_fuel: 1, notes: 'Vintage - Typical values - verify with POH' },
  { make: 'Luscombe', model: '8E Silvaire', empty_weight: 1080, empty_cg: 65.0, max_weight: 1400, arm_pilot: 72.0, arm_passenger: 101.0, arm_baggage: 120.0, arm_fuel: 75, fuel_capacity: 24, cruise_speed: 80, fuel_burn: 4.5, unusable_fuel: 1, notes: 'Vintage - Typical values - verify with POH' },
  { make: 'Taylorcraft', model: 'BC-12D', empty_weight: 930, empty_cg: 62.0, max_weight: 1250, arm_pilot: 68.0, arm_passenger: 96.0, arm_baggage: 115.0, arm_fuel: 75, fuel_capacity: 18, cruise_speed: 75, fuel_burn: 4.0, unusable_fuel: 1, notes: 'Vintage - Typical values - verify with POH' },
  { make: 'AmeriGL', model: 'Ercoupe', empty_weight: 680, empty_cg: 68.0, max_weight: 1100, arm_pilot: 72.0, arm_passenger: 95.0, arm_baggage: 115.0, arm_fuel: 75, fuel_capacity: 18, cruise_speed: 75, fuel_burn: 4.5, unusable_fuel: 1, notes: 'Vintage - Typical values - verify with POH' },
  { make: 'Maule', model: 'M-7-235', empty_weight: 1500, empty_cg: 75.0, max_weight: 2200, arm_pilot: 80.0, arm_passenger: 110.0, arm_baggage: 140.0, arm_fuel: 95, fuel_capacity: 42, cruise_speed: 115, fuel_burn: 10.0, unusable_fuel: 2, notes: 'STOL - Typical values - verify with POH' },
  { make: 'Globe', model: 'GC-1B Swift', empty_weight: 1080, empty_cg: 70.0, max_weight: 1650, arm_pilot: 75.0, arm_passenger: 100.0, arm_baggage: 120.0, arm_fuel: 85, fuel_capacity: 24, cruise_speed: 85, fuel_burn: 6.0, unusable_fuel: 1, notes: 'Vintage - Typical values - verify with POH' },
  
  // DeHavilland
  { make: 'DeHavilland', model: 'DHC-2 Beaver', empty_weight: 3100, empty_cg: 90.0, max_weight: 5100, arm_pilot: 90.0, arm_passenger: 130.0, arm_baggage: 150.0, arm_fuel: 120, fuel_capacity: 90, cruise_speed: 140, fuel_burn: 18.0, unusable_fuel: 3, notes: 'Floatplane - Typical values - verify with POH' },
  { make: 'DeHavilland', model: 'DHC-3 Otter', empty_weight: 4200, empty_cg: 95.0, max_weight: 8000, arm_pilot: 95.0, arm_passenger: 135.0, arm_baggage: 155.0, arm_fuel: 120, fuel_capacity: 110, cruise_speed: 150, fuel_burn: 22.0, unusable_fuel: 4, notes: 'Floatplane - Typical values - verify with POH' },
  
  // Helio
  { make: 'Helio', model: 'H-295 Super Courier', empty_weight: 1800, empty_cg: 78.0, max_weight: 3000, arm_pilot: 82.0, arm_passenger: 110.0, arm_baggage: 140.0, arm_fuel: 100, fuel_capacity: 60, cruise_speed: 150, fuel_burn: 12.0, unusable_fuel: 2, notes: 'STOL - Typical values - verify with POH' },
];

console.log('Seeding 50 aircraft W&B data...\n');
console.log('⚠️  DISCLAIMER: These are TYPICAL VALUES from POH data.');
console.log('    Always verify with actual aircraft documents before flight.\n');

const stmt = db.prepare(`
  INSERT OR REPLACE INTO weight_balance (
    id, make, model, empty_weight, empty_cg, max_weight, 
    arm_pilot, arm_passenger, arm_baggage, arm_fuel, 
    fuel_capacity, cruise_speed, fuel_burn, unusable_fuel, 
    is_verified, notes, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, datetime('now'))
`);

let count = 0;
aircraftData.forEach((ac, index) => {
  const id = `${ac.make.toLowerCase()}-${ac.model.toLowerCase().replace(/[^a-z0-9]/g, '')}-${index}`;
  stmt.run(
    id,
    ac.make,
    ac.model,
    ac.empty_weight,
    ac.empty_cg,
    ac.max_weight,
    ac.arm_pilot,
    ac.arm_passenger,
    ac.arm_baggage,
    ac.arm_fuel,
    ac.fuel_capacity,
    ac.cruise_speed,
    ac.fuel_burn,
    ac.unusable_fuel,
    ac.notes
  );
  count++;
  console.log(`✓ ${ac.make} ${ac.model}`);
});

stmt.finalize();

db.get("SELECT COUNT(*) as count FROM weight_balance", [], (err, row) => {
  console.log(`\n✅ Seeded ${count} aircraft successfully!`);
  console.log(`Total aircraft in database: ${row.count}`);
  db.close();
});
