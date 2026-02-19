const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrate() {
  try {
    console.log('Starting migration...');
    
    // Step 1: Add columns using raw SQL
    console.log('Adding columns...');
    
    await prisma.$executeRawUnsafe(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = 'username' AND object_id = OBJECT_ID('User'))
      ALTER TABLE [User] ADD username NVARCHAR(50) NULL;
    `);
    console.log('✓ username column added');
    
    await prisma.$executeRawUnsafe(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = 'emailVerified' AND object_id = OBJECT_ID('User'))
      ALTER TABLE [User] ADD emailVerified DATETIME NULL;
    `);
    console.log('✓ emailVerified column added');
    
    await prisma.$executeRawUnsafe(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = 'verifyToken' AND object_id = OBJECT_ID('User'))
      ALTER TABLE [User] ADD verifyToken NVARCHAR(255) NULL;
    `);
    console.log('✓ verifyToken column added');
    
    await prisma.$executeRawUnsafe(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = 'verifyTokenExpiry' AND object_id = OBJECT_ID('User'))
      ALTER TABLE [User] ADD verifyTokenExpiry DATETIME NULL;
    `);
    console.log('✓ verifyTokenExpiry column added');
    
    // Step 2: Get all users using raw query
    console.log('\nFetching users...');
    const users = await prisma.$queryRaw`
      SELECT id, email, createdAt FROM [User] WHERE username IS NULL
    `;
    
    console.log(`Found ${users.length} users to update`);
    
    // Step 3: Generate unique usernames for each user
    const usedUsernames = new Set();
    
    for (const user of users) {
      // Generate base username from email
      let baseUsername = user.email
        .split('@')[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_');
      
      let username = baseUsername;
      let counter = 1;
      
      // Ensure uniqueness
      while (usedUsernames.has(username)) {
        username = `${baseUsername}_${counter}`;
        counter++;
        
        if (counter > 1000) {
          username = `user_${user.id.substring(0, 8)}`;
          break;
        }
      }
      
      usedUsernames.add(username);
      
      // Update user using raw query
      await prisma.$executeRaw`
        UPDATE [User] 
        SET username = ${username}, 
            emailVerified = ${user.createdAt}
        WHERE id = ${user.id}
      `;
      
      console.log(`✓ Updated ${user.email} → ${username}`);
    }
    
    // Step 4: Create unique index
    console.log('\nCreating unique index...');
    await prisma.$executeRawUnsafe(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_User_username' AND object_id = OBJECT_ID('User'))
      CREATE UNIQUE INDEX IX_User_username ON [User](username) WHERE username IS NOT NULL;
    `);
    console.log('✓ Unique index created');
    
    // Verify
    const stats = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total,
        COUNT(username) as with_username,
        COUNT(emailVerified) as verified
      FROM [User]
    `;
    
    console.log('\n========================================');
    console.log('Migration completed successfully!');
    console.log('========================================');
    console.log(`Total users: ${stats[0].total}`);
    console.log(`Users with username: ${stats[0].with_username}`);
    console.log(`Verified users: ${stats[0].verified}`);
    
  } catch (error) {
    console.error('\nMigration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
