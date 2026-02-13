const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@demo.com';
  const password = 'password123';
  
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log('User not found');
    return;
  }
  
  console.log('User found:', user.email);
  console.log('Stored password:', user.password?.substring(0, 20));
  
  const isValid = await bcrypt.compare(password, user.password);
  console.log('Password valid:', isValid);
}

main().catch(console.error).finally(() => process.exit());
