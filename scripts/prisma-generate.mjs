import { execSync } from 'child_process';

console.log('Regenerating Prisma client...');
execSync('npx prisma generate', { stdio: 'inherit', cwd: '/vercel/share/v0-project' });
console.log('Prisma client regenerated successfully.');
