const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrate() {
  try {
    console.log('Checking if LogbookEntry table exists...');
    
    // Check if table exists
    const tableExists = await prisma.$queryRaw`
      SELECT * FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'LogbookEntry'
    `;
    
    if (tableExists.length > 0) {
      console.log('✓ LogbookEntry table already exists');
      return;
    }
    
    console.log('Creating LogbookEntry table...');
    
    // Create table without foreign key (we'll handle referential integrity in app)
    await prisma.$executeRaw`
      CREATE TABLE [LogbookEntry] (
        [id] NVARCHAR(36) NOT NULL PRIMARY KEY,
        [userId] NVARCHAR(36) NOT NULL,
        [date] DATETIME NOT NULL,
        [aircraft] NVARCHAR(100) NOT NULL,
        [routeFrom] NVARCHAR(10) NOT NULL,
        [routeTo] NVARCHAR(10) NOT NULL,
        [totalTime] FLOAT NOT NULL DEFAULT 0,
        [soloTime] FLOAT NOT NULL DEFAULT 0,
        [dualGiven] FLOAT NOT NULL DEFAULT 0,
        [dualReceived] FLOAT NOT NULL DEFAULT 0,
        [nightTime] FLOAT NOT NULL DEFAULT 0,
        [instrumentTime] FLOAT NOT NULL DEFAULT 0,
        [crossCountryTime] FLOAT NOT NULL DEFAULT 0,
        [dayLandings] INT NOT NULL DEFAULT 0,
        [nightLandings] INT NOT NULL DEFAULT 0,
        [remarks] NVARCHAR(MAX) NULL,
        [instructor] NVARCHAR(100) NULL,
        [flightPlanId] NVARCHAR(100) NULL,
        [createdAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [updatedAt] DATETIME NOT NULL DEFAULT GETDATE()
      )
    `;
    
    console.log('✓ LogbookEntry table created');
    
    // Create indexes
    await prisma.$executeRaw`
      CREATE INDEX [IX_LogbookEntry_userId] ON [LogbookEntry]([userId])
    `;
    console.log('✓ Index on userId created');
    
    await prisma.$executeRaw`
      CREATE INDEX [IX_LogbookEntry_date] ON [LogbookEntry]([date])
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
