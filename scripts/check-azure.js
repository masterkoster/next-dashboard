const sql = require('mssql');

async function main() {
  const config = {
    server: 'aviation-server-dk.database.windows.net',
    database: 'aviation_db',
    user: 'CloudSA183a5780',
    password: 'Password123',
    options: { encrypt: true, trustServerCertificate: false }
  };
  
  const pool = await sql.connect(config);
  
  // Get user
  const result = await pool.query`SELECT email, password FROM [User] WHERE email = 'demo@demo.com'`;
  
  if (result.recordset.length === 0) {
    console.log('User not found in Azure');
    return;
  }
  
  const user = result.recordset[0];
  console.log('Azure user:', user.email);
  console.log('Azure password:', user.password?.substring(0, 20));
  
  // Get local for comparison
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const local = await prisma.user.findUnique({ where: { email: 'demo@demo.com' } });
  console.log('Local password:', local.password?.substring(0, 20));
  
  console.log('Passwords match:', user.password === local.password);
}

main().catch(console.error).finally(() => process.exit());
