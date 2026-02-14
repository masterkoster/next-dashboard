// Quick script to verify database tables
const pymssql = require('pymssql');

async function check() {
  const conn = await new Promise((resolve, reject) => {
    pymssql.connect({
      server: 'aviation-server-dk.database.windows.net',
      database: 'aviation_db',
      user: 'CloudSA183a5780',
      password: 'Password123',
      options: {
        encrypt: true,
        trustServerCertificate: false
      }
    }).then(resolve).catch(reject);
  });

  const request = conn.request();
  
  // Check tables
  console.log('=== Checking tables ===');
  const tables = await request.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_TYPE = 'BASE TABLE'
    ORDER BY TABLE_NAME
  `);
  
  console.log('Tables:');
  tables.recordset.forEach(t => console.log('  -', t.TABLE_NAME));
  
  // Check AircraftSpecs
  console.log('\n=== AircraftSpecs ===');
  try {
    const specsCount = await request.query('SELECT COUNT(*) as cnt FROM AircraftSpecs');
    console.log('Row count:', specsCount.recordset[0].cnt);
    
    if (specsCount.recordset[0].cnt > 0) {
      const sample = await request.query('SELECT TOP 3 * FROM AircraftSpecs');
      console.log('\nSample data:');
      console.log(JSON.stringify(sample.recordset, null, 2));
    }
  } catch(e) {
    console.log('Error:', e.message);
  }
  
  // Check AircraftPerformance
  console.log('\n=== AircraftPerformance ===');
  try {
    const perfCount = await request.query('SELECT COUNT(*) as cnt FROM AircraftPerformance');
    console.log('Row count:', perfCount.recordset[0].cnt);
  } catch(e) {
    console.log('Error:', e.message);
  }
  
  // Test matching query for Cessna 150L
  console.log('\n=== Test matching for Cessna 150 ===');
  try {
    const test = await request.query(`
      SELECT TOP 1 * FROM AircraftSpecs 
      WHERE UPPER(manufacturer) LIKE '%CESSNA%'
        AND UPPER(model) LIKE '%150%'
    `);
    console.log('Result:', test.recordset.length > 0 ? 'FOUND' : 'NOT FOUND');
    if (test.recordset.length > 0) {
      console.log(JSON.stringify(test.recordset[0], null, 2));
    }
  } catch(e) {
    console.log('Error:', e.message);
  }
  
  conn.close();
}

check().catch(console.error);
