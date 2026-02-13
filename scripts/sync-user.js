const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Get user from local
  const localUser = await prisma.user.findUnique({ where: { email: 'test@test.com' } });
  console.log('Local user:', localUser.email, 'pwd length:', localUser.password.length);
  
  // Now try Azure directly via raw SQL
  const sql = require('mssql');
  
  const config = {
    server: 'aviation-server-dk.database.windows.net',
    database: 'aviation_db',
    user: 'CloudSA183a5780',
    password: 'Password123',
    options: {
      encrypt: true,
      trustServerCertificate: false
    }
  };
  
  const pool = await sql.connect(config);
  
  // Check if user exists
  let result = await pool.query`SELECT * FROM [User] WHERE email = 'test@test.com'`;
  console.log('Azure users found:', result.recordset.length);
  
  if (result.recordset.length === 0) {
    // Insert user
    await pool.query`
      INSERT INTO [User] (id, email, name, password, purchasedModules, credits, createdAt, updatedAt)
      VALUES (NEWID(), 'test@test.com', 'Test User', ${localUser.password}, '[]', 100, GETDATE(), GETDATE())
    `;
    console.log('User created in Azure');
  } else {
    console.log('User already exists in Azure');
  }
  
  await sql.close();
}

main().catch(console.error);
