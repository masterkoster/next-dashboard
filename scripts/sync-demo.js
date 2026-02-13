const { PrismaClient } = require('@prisma/client');
const sql = require('mssql');

const prisma = new PrismaClient();

async function main() {
  // Get user from local
  const local = await prisma.user.findUnique({ where: { email: 'demo@demo.com' } });
  console.log('Local user:', local.email, 'pwd:', local.password.substring(0, 20));
  
  // Connect to Azure
  const config = {
    server: 'aviation-server-dk.database.windows.net',
    database: 'aviation_db',
    user: 'CloudSA183a5780',
    password: 'Password123',
    options: { encrypt: true, trustServerCertificate: false }
  };
  
  try {
    const pool = await sql.connect(config);
    
    // Check if exists
    const check = await pool.query`SELECT email FROM [User] WHERE email = 'demo@demo.com'`;
    
    if (check.recordset.length === 0) {
      // Insert
      await pool.query`
        INSERT INTO [User] (id, email, name, password, purchasedModules, credits, createdAt, updatedAt)
        VALUES (NEWID(), 'demo@demo.com', 'Demo User', ${local.password}, '[]', 100, GETDATE(), GETDATE())
      `;
      console.log('Created in Azure');
    } else {
      // Update
      await pool.query`UPDATE [User] SET password = ${local.password} WHERE email = 'demo@demo.com'`;
      console.log('Updated in Azure');
    }
  } catch (e) {
    console.log('Azure error (user might already exist):', e.message);
  }
}

main().catch(console.error).finally(() => process.exit());
