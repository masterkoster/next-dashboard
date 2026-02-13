const sql = require('mssql');

async function main() {
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
  
  // Get user
  let result = await pool.query`SELECT email, password FROM [User] WHERE email = 'test@test.com'`;
  console.log('Azure password length:', result.recordset[0]?.password?.length);
  console.log('Local password should be:', 60);
  
  // Get local user for comparison
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const local = await prisma.user.findUnique({ where: { email: 'test@test.com' } });
  console.log('Local password:', local.password.substring(0, 20) + '...');
  console.log('Azure password:', result.recordset[0]?.password?.substring(0, 20) + '...');
  
  await sql.close();
}

main().catch(console.error);
