/**
 * Seed FBO fees for common airports
 * Run: node scripts/seed-fbo-fees.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'aviation_hub.db');

const db = new sqlite3.Database(DB_PATH);

// Common US airports with typical FBO fees
// These are estimates - real fees vary by FBO and change frequently
const fboFeesData = [
  // Seattle Area
  { icao: 'KPAE', fbo_name: 'Snohomish County Airport', ramp_fee: 35, overnight_fee: 25, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '425-353-9857', amenities: JSON.stringify({ crew_car: true, rental_car: true, conference: true, wifi: true }) },
  { icao: 'KSEA', fbo_name: 'Sea-Tac Intl', ramp_fee: 75, overnight_fee: 50, handling_fee: 100, fuel_minimum: 100, credit_card_fee: 3, phone: '206-433-5378', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true, lounge: true }) },
  { icao: 'KBFI', fbo_name: 'King County Intl', ramp_fee: 45, overnight_fee: 30, handling_fee: 50, fuel_minimum: 0, credit_card_fee: 0, phone: '206-296-7330', amenities: JSON.stringify({ crew_car: true, rental_car: true, wifi: true }) },
  
  // Portland Area
  { icao: 'KPDX', fbo_name: 'Portland Intl', ramp_fee: 65, overnight_fee: 40, handling_fee: 75, fuel_minimum: 50, credit_card_fee: 0, phone: '503-335-2700', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true, lounge: true }) },
  { icao: 'KHIO', fbo_name: 'Hillsboro Airport', ramp_fee: 30, overnight_fee: 20, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '503-629-4886', amenities: JSON.stringify({ crew_car: true, wifi: true }) },
  
  // San Francisco Area
  { icao: 'KSFO', fbo_name: 'San Francisco Intl', ramp_fee: 125, overnight_fee: 85, handling_fee: 150, fuel_minimum: 200, credit_card_fee: 3, phone: '650-877-5427', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true, lounge: true, shower: true }) },
  { icao: 'KOAK', fbo_name: 'Oakland Intl', ramp_fee: 55, overnight_fee: 40, handling_fee: 60, fuel_minimum: 50, credit_card_fee: 0, phone: '510-563-6464', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true }) },
  { icao: 'KSJC', fbo_name: 'San Jose Intl', ramp_fee: 55, overnight_fee: 35, handling_fee: 50, fuel_minimum: 50, credit_card_fee: 0, phone: '408-299-5850', amenities: JSON.stringify({ crew_car: true, rental_car: true, wifi: true }) },
  
  // Los Angeles Area
  { icao: 'KLAX', fbo_name: 'Los Angeles Intl', ramp_fee: 150, overnight_fee: 100, handling_fee: 200, fuel_minimum: 300, credit_card_fee: 3, phone: '310-646-2842', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true, lounge: true, shower: true }) },
  { icao: 'KVNY', fbo_name: 'Van Nuys', ramp_fee: 45, overnight_fee: 30, handling_fee: 50, fuel_minimum: 25, credit_card_fee: 0, phone: '818-780-9696', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true }) },
  { icao: 'KHHR', fbo_name: 'Hawthorne Municipal', ramp_fee: 25, overnight_fee: 20, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '310-349-1635', amenities: JSON.stringify({ wifi: true }) },
  { icao: 'KBUR', fbo_name: 'Burbank', ramp_fee: 50, overnight_fee: 35, handling_fee: 50, fuel_minimum: 25, credit_card_fee: 0, phone: '818-840-8840', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true }) },
  
  // Denver Area
  { icao: 'KDEN', fbo_name: 'Denver Intl', ramp_fee: 85, overnight_fee: 55, handling_fee: 100, fuel_minimum: 100, credit_card_fee: 0, phone: '303-342-4400', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true, lounge: true }) },
  { icao: 'KAPA', fbo_name: 'Centennial Airport', ramp_fee: 35, overnight_fee: 25, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '303-790-0598', amenities: JSON.stringify({ crew_car: true, wifi: true }) },
  { icao: 'KBJC', fbo_name: 'Rocky Mountain Metro', ramp_fee: 30, overnight_fee: 20, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '303-271-8700', amenities: JSON.stringify({ wifi: true }) },
  
  // Phoenix Area
  { icao: 'KPHX', fbo_name: 'Phoenix Sky Harbor', ramp_fee: 75, overnight_fee: 50, handling_fee: 85, fuel_minimum: 75, credit_card_fee: 0, phone: '602-273-7290', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true, lounge: true }) },
  { icao: 'KDVT', fbo_name: 'Deer Valley', ramp_fee: 25, overnight_fee: 15, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '623-935-5900', amenities: JSON.stringify({ wifi: true }) },
  { icao: 'KSDL', fbo_name: 'Scottsdale Airport', ramp_fee: 30, overnight_fee: 20, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '483-9000', amenities: JSON.stringify({ crew_car: true, wifi: true }) },
  
  // Las Vegas Area
  { icao: 'KLAS', fbo_name: 'McCarran Intl', ramp_fee: 95, overnight_fee: 60, handling_fee: 125, fuel_minimum: 150, credit_card_fee: 3, phone: '702-261-3800', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true, lounge: true, shower: true }) },
  { icao: 'KHND', fbo_name: 'Henderson Executive', ramp_fee: 35, overnight_fee: 25, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '702-261-0000', amenities: JSON.stringify({ crew_car: true, wifi: true }) },
  
  // Dallas/Fort Worth Area
  { icao: 'KDFW', fbo_name: 'Dallas/Fort Worth Intl', ramp_fee: 100, overnight_fee: 65, handling_fee: 125, fuel_minimum: 150, credit_card_fee: 0, phone: '972-973-3112', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true, lounge: true, shower: true }) },
  { icao: 'KDAL', fbo_name: 'Dallas Love Field', ramp_fee: 50, overnight_fee: 35, handling_fee: 50, fuel_minimum: 25, credit_card_fee: 0, phone: '214-670-6913', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true }) },
  { icao: 'KAFW', fbo_name: 'Fort Worth Alliance', ramp_fee: 40, overnight_fee: 30, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '817-890-4600', amenities: JSON.stringify({ crew_car: true, wifi: true }) },
  
  // Houston Area
  { icao: 'KIAH', fbo_name: 'George Bush Intl', ramp_fee: 95, overnight_fee: 60, handling_fee: 125, fuel_minimum: 150, credit_card_fee: 3, phone: '281-233-1730', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true, lounge: true, shower: true }) },
  { icao: 'KHOU', fbo_name: 'William P Hobby', ramp_fee: 45, overnight_fee: 30, handling_fee: 50, fuel_minimum: 25, credit_card_fee: 0, phone: '713-884-6891', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true }) },
  { icao: 'KCLL', fbo_name: 'Easterwood Field', ramp_fee: 25, overnight_fee: 20, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '979-846-1740', amenities: JSON.stringify({ wifi: true }) },
  
  // Chicago Area
  { icao: 'KORD', fbo_name: "O'Hare Intl", ramp_fee: 125, overnight_fee: 85, handling_fee: 175, fuel_minimum: 200, credit_card_fee: 3, phone: '847-294-1448', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true, lounge: true, shower: true }) },
  { icao: 'KMID', fbo_name: 'Chicago Midway', ramp_fee: 55, overnight_fee: 40, handling_fee: 60, fuel_minimum: 50, credit_card_fee: 0, phone: '708-563-3350', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true }) },
  { icao: 'KPWK', fbo_name: 'Chicago Executive', ramp_fee: 35, overnight_fee: 25, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '847-259-6000', amenities: JSON.stringify({ crew_car: true, wifi: true }) },
  
  // Atlanta Area
  { icao: 'KATL', fbo_name: 'Hartsfield-Jackson', ramp_fee: 115, overnight_fee: 75, handling_fee: 150, fuel_minimum: 200, credit_card_fee: 3, phone: '404-530-6600', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true, lounge: true, shower: true }) },
  { icao: 'KPDK', fbo_name: 'DeKalb-Peachtree', ramp_fee: 30, overnight_fee: 20, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '404-559-2600', amenities: JSON.stringify({ crew_car: true, wifi: true }) },
  { icao: 'KFTY', fbo_name: 'Fulton County', ramp_fee: 25, overnight_fee: 18, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '404-699-6800', amenities: JSON.stringify({ wifi: true }) },
  
  // Miami Area
  { icao: 'KMIA', fbo_name: 'Miami Intl', ramp_fee: 125, overnight_fee: 85, handling_fee: 175, fuel_minimum: 200, credit_card_fee: 3, phone: '305-876-7070', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true, lounge: true, shower: true }) },
  { icao: 'KOPF', fbo_name: 'Miami Opa Locka', ramp_fee: 40, overnight_fee: 30, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '305-869-1660', amenities: JSON.stringify({ crew_car: true, wifi: true }) },
  { icao: 'KTMB', fbo_name: 'Miami Executive', ramp_fee: 30, overnight_fee: 20, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '305-234-8361', amenities: JSON.stringify({ wifi: true }) },
  
  // New York Area
  { icao: 'KJFK', fbo_name: 'John F Kennedy Intl', ramp_fee: 175, overnight_fee: 125, handling_fee: 250, fuel_minimum: 400, credit_card_fee: 3, phone: '718-244-7475', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true, lounge: true, shower: true }) },
  { icao: 'KLGA', fbo_name: 'LaGuardia', ramp_fee: 145, overnight_fee: 100, handling_fee: 200, fuel_minimum: 300, credit_card_fee: 3, phone: '718-533-3900', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true, lounge: true }) },
  { icao: 'KEWR', fbo_name: 'Newark Liberty', ramp_fee: 135, overnight_fee: 90, handling_fee: 175, fuel_minimum: 250, credit_card_fee: 3, phone: '973-961-6000', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true, lounge: true, shower: true }) },
  { icao: 'KTEB', fbo_name: 'Teterboro', ramp_fee: 85, overnight_fee: 55, handling_fee: 100, fuel_minimum: 100, credit_card_fee: 0, phone: '201-288-1800', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true, lounge: true }) },
  { icao: 'KHPN', fbo_name: 'Westchester County', ramp_fee: 50, overnight_fee: 35, handling_fee: 50, fuel_minimum: 25, credit_card_fee: 0, phone: '914-948-6520', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true }) },
  
  // Boston Area
  { icao: 'KBOS', fbo_name: 'Boston Logan Intl', ramp_fee: 125, overnight_fee: 85, handling_fee: 175, fuel_minimum: 200, credit_card_fee: 3, phone: '617-561-1800', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true, lounge: true, shower: true }) },
  { icao: 'KBED', fbo_name: 'Hanscom Field', ramp_fee: 45, overnight_fee: 30, handling_fee: 50, fuel_minimum: 25, credit_card_fee: 0, phone: '781-274-0700', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true }) },
  { icao: 'KOWD', fbo_name: 'Norwood Memorial', ramp_fee: 30, overnight_fee: 20, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '781-769-2100', amenities: JSON.stringify({ wifi: true }) },
  
  // Washington DC Area
  { icao: 'KIAD', fbo_name: 'Washington Dulles', ramp_fee: 95, overnight_fee: 65, handling_fee: 125, fuel_minimum: 150, credit_card_fee: 3, phone: '703-572-8250', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true, lounge: true, shower: true }) },
  { icao: 'KDCA', fbo_name: 'Reagan National', ramp_fee: 85, overnight_fee: 55, handling_fee: 100, fuel_minimum: 100, credit_card_fee: 0, phone: '703-417-0342', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true }) },
  { icao: 'KBWI', fbo_name: 'Baltimore/Washington', ramp_fee: 55, overnight_fee: 40, handling_fee: 60, fuel_minimum: 50, credit_card_fee: 0, phone: '410-859-7017', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true }) },
  
  // Detroit Area
  { icao: 'KDTW', fbo_name: 'Detroit Metro Wayne County', ramp_fee: 85, overnight_fee: 55, handling_fee: 100, fuel_minimum: 100, credit_card_fee: 0, phone: '734-942-3540', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true, lounge: true }) },
  { icao: 'KTTF', fbo_name: 'Monroe', ramp_fee: 25, overnight_fee: 18, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '734-384-5100', amenities: JSON.stringify({ wifi: true }) },
  
  // Minneapolis Area
  { icao: 'KMSP', fbo_name: 'Minneapolis-St Paul', ramp_fee: 75, overnight_fee: 50, handling_fee: 100, fuel_minimum: 100, credit_card_fee: 0, phone: '612-725-4500', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true, lounge: true }) },
  { icao: 'KMIC', fbo_name: 'Crystal Airport', ramp_fee: 20, overnight_fee: 15, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '612-588-9576', amenities: JSON.stringify({ wifi: true }) },
  
  // Nashville Area
  { icao: 'KBNA', fbo_name: 'Nashville Intl', ramp_fee: 55, overnight_fee: 40, handling_fee: 60, fuel_minimum: 50, credit_card_fee: 0, phone: '615-275-1675', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true }) },
  { icao: 'KMQY', fbo_name: 'Smyrna Airport', ramp_fee: 20, overnight_fee: 15, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '615-223-3509', amenities: JSON.stringify({ wifi: true }) },
  
  // Charlotte Area
  { icao: 'KCLT', fbo_name: 'Charlotte Douglas Intl', ramp_fee: 75, overnight_fee: 50, handling_fee: 85, fuel_minimum: 75, credit_card_fee: 0, phone: '704-359-4000', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true, lounge: true }) },
  { icao: 'KCHO', fbo_name: 'Charlottesville-Albemarle', ramp_fee: 25, overnight_fee: 18, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '434-973-9791', amenities: JSON.stringify({ wifi: true }) },
  
  // Orlando Area
  { icao: 'KMCO', fbo_name: 'Orlando Intl', ramp_fee: 75, overnight_fee: 50, handling_fee: 85, fuel_minimum: 75, credit_card_fee: 0, phone: '407-825-2000', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true, lounge: true }) },
  { icao: 'KORL', fbo_name: 'Orlando Executive', ramp_fee: 35, overnight_fee: 25, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '407-896-0500', amenities: JSON.stringify({ crew_car: true, wifi: true }) },
  { icao: 'KTIX', fbo_name: 'Space Coast Regional', ramp_fee: 20, overnight_fee: 15, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '321-267-8780', amenities: JSON.stringify({ wifi: true }) },
  
  // Salt Lake City Area
  { icao: 'KSLC', fbo_name: 'Salt Lake City Intl', ramp_fee: 65, overnight_fee: 45, handling_fee: 75, fuel_minimum: 75, credit_card_fee: 0, phone: '801-575-2400', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true, lounge: true }) },
  { icao: 'KPVU', fbo_name: 'Provo Municipal', ramp_fee: 25, overnight_fee: 18, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '801-373-8686', amenities: JSON.stringify({ wifi: true }) },
  
  // Albuquerque Area
  { icao: 'KABQ', fbo_name: 'Albuquerque Intl Sunport', ramp_fee: 45, overnight_fee: 30, handling_fee: 50, fuel_minimum: 25, credit_card_fee: 0, phone: '505-244-7700', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true }) },
  { icao: 'KAEG', fbo_name: 'Double Eagle II', ramp_fee: 20, overnight_fee: 15, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, 'phone': '505-884-1613', amenities: JSON.stringify({ wifi: true }) },
  
  // Reno Area
  { icao: 'KRNO', fbo_name: 'Reno-Tahoe Intl', ramp_fee: 45, overnight_fee: 30, handling_fee: 50, fuel_minimum: 25, credit_card_fee: 0, phone: '775-328-6400', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true }) },
  { icao: 'KTRK', fbo_name: 'Truckee-Tahoe', ramp_fee: 35, overnight_fee: 25, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '530-587-4119', amenities: JSON.stringify({ wifi: true }) },
  
  // Honolulu Area
  { icao: 'PHNL', fbo_name: 'Daniel K Inouye Intl', ramp_fee: 95, overnight_fee: 65, handling_fee: 125, fuel_minimum: 150, credit_card_fee: 0, phone: '808-836-6413', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true, lounge: true }) },
  { icao: 'PHOG', fbo_name: 'Kahului Airport', ramp_fee: 45, overnight_fee: 30, handling_fee: 50, fuel_minimum: 25, credit_card_fee: 0, phone: '808-872-3830', amenities: JSON.stringify({ crew_car: true, wifi: true }) },
  
  // Anchorage Area
  { icao: 'PANC', fbo_name: 'Ted Stevens Anchorage Intl', ramp_fee: 65, overnight_fee: 45, handling_fee: 75, fuel_minimum: 75, credit_card_fee: 0, phone: '907-266-5300', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true, lounge: true }) },
  { icao: 'PAFA', fbo_name: 'Fairbanks Intl', ramp_fee: 45, overnight_fee: 30, handling_fee: 50, fuel_minimum: 25, credit_card_fee: 0, phone: '907-474-0700', amenities: JSON.stringify({ crew_car: true, restaurant: true }) },
  
  // Popular Destinations
  { icao: 'KOSH', fbo_name: 'Oshkosh Wittman', ramp_fee: 30, overnight_fee: 20, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '920-236-5040', amenities: JSON.stringify({ wifi: true, restaurant: true }) },
  { icao: 'KSUN', fbo_name: 'Friedman Memorial', ramp_fee: 30, overnight_fee: 20, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, 'phone': '208-788-4956', amenities: JSON.stringify({ wifi: true }) },
  { icao: 'KTWF', fbo_name: 'Joslin Field - Magic Valley', ramp_fee: 25, overnight_fee: 18, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '208-733-3438', amenities: JSON.stringify({ wifi: true }) },
  { icao: 'KEKO', fbo_name: 'Elko Regional', ramp_fee: 20, overnight_fee: 15, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '775-738-4044', amenities: JSON.stringify({ wifi: true }) },
  { icao: 'KSLE', fbo_name: 'Salem Municipal', ramp_fee: 25, overnight_fee: 18, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '503-588-8420', amenities: JSON.stringify({ wifi: true }) },
  { icao: 'KBLI', fbo_name: 'Bellingham Intl', ramp_fee: 25, overnight_fee: 18, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '360-676-2700', amenities: JSON.stringify({ wifi: true, crew_car: true }) },
  { icao: 'KGEG', fbo_name: 'Spokane Intl', ramp_fee: 40, overnight_fee: 28, handling_fee: 45, fuel_minimum: 20, credit_card_fee: 0, phone: '509-455-6455', amenities: JSON.stringify({ crew_car: true, rental_car: true, restaurant: true }) },
  { icao: 'KYKM', fbo_name: 'Yakima Air Terminal', ramp_fee: 20, overnight_fee: 15, handling_fee: 0, fuel_minimum: 0, credit_card_fee: 0, phone: '509-575-6149', amenities: JSON.stringify({ wifi: true }) },
];

console.log('Seeding FBO fees...\n');

const stmt = db.prepare(`
  INSERT OR REPLACE INTO fbo_fees 
  (icao, fbo_name, ramp_fee, overnight_fee, handling_fee, fuel_minimum, credit_card_fee, phone, amenities, source)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'seed')
`);

let inserted = 0;
fboFeesData.forEach(data => {
  stmt.run(
    data.icao,
    data.fbo_name,
    data.ramp_fee,
    data.overnight_fee,
    data.handling_fee,
    data.fuel_minimum,
    data.credit_card_fee,
    data.phone,
    data.amenities
  );
  inserted++;
});

stmt.finalize((err) => {
  if (err) {
    console.error('Error seeding FBO fees:', err);
  } else {
    console.log(`✅ Seeded ${inserted} FBO fee records`);
    
    // Verify count
    db.get("SELECT COUNT(*) as count FROM fbo_fees", (err, row) => {
      if (err) {
        console.error('Error counting records:', err);
      } else {
        console.log(`   Total records in database: ${row.count}`);
      }
      db.close();
    });
  }
});
