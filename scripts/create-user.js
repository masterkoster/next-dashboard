const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Create user in local database
  const hash = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@demo.com' },
    update: { password: hash },
    create: {
      email: 'demo@demo.com',
      name: 'Demo User',
      password: hash,
      purchasedModules: '[]',
      credits: 100
    }
  });
  
  console.log('Created/updated user:', user.email);
}

main().catch(console.error).finally(() => process.exit());
