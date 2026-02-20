const { execSync } = require('child_process');
const { rmSync } = require('fs');

const cwd = '/vercel/share/v0-project';

// Clear the old generated client to force a clean regeneration
try {
  rmSync(`${cwd}/node_modules/.prisma`, { recursive: true, force: true });
  console.log('Cleared old .prisma generated client.');
} catch (e) {
  console.log('No old .prisma client to clear.');
}

console.log('Regenerating Prisma client with engineType=binary...');
execSync('npx prisma generate', { stdio: 'inherit', cwd });
console.log('Prisma client regenerated successfully.');
