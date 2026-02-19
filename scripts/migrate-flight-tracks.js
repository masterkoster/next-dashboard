const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrate() {
  try {
    console.log('Checking if FlightTrack table exists...');
    
    // Check if table exists
    const tableExists = await prisma.$queryRaw`
      SELECT * FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'FlightTrack'
    `;
    
    if (tableExists.length > 0) {
      console.log('✓ FlightTrack table already exists');
      return;
    }
    
    console.log('Creating FlightTrack table...');
    
    // Create table
    await prisma.$executeRaw`
      CREATE TABLE [FlightTrack] (
        [id] NVARCHAR(36) NOT NULL PRIMARY KEY,
        [userId] NVARCHAR(36) NOT NULL,
        [name] NVARCHAR(200) NOT NULL,
        [date] DATETIME NOT NULL,
        [aircraft] NVARCHAR(100) NULL,
        [trackData] NVARCHAR(MAX) NOT NULL,
        [totalDistance] FLOAT NOT NULL DEFAULT 0,
        [maxAltitude] FLOAT NOT NULL DEFAULT 0,
        [maxSpeed] FLOAT NOT NULL DEFAULT 0,
        [duration] FLOAT NOT NULL DEFAULT 0,
        [createdAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [updatedAt] DATETIME NOT NULL DEFAULT GETDATE()
      )
    `;
    
    console.log('✓ FlightTrack table created');
    
    // Create indexes
    await prisma.$executeRaw`
      CREATE INDEX [IX_FlightTrack_userId] ON [FlightTrack]([userId])
    `;
    console.log('✓ Index on userId created');
    
    await prisma.$executeRaw`
      CREATE INDEX [IX_FlightTrack_date] ON [FlightTrack]([date])
    `;
    console.log('✓ Index on date created');
    
    console.log('\n========================================');
    console.log('Migration completed successfully!');
    console.log('========================================');
    
  } catch (error) {
    console.error('\nMigration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
