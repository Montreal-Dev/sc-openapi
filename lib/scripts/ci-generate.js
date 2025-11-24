import { execSync } from 'child_process';

async function main() {
  console.log('📦 Generating SDK with `pnpm run gen`...');

  execSync('pnpm run gen', { stdio: 'inherit' });

  console.log('✅ SDK generation complete.');
  process.exit(0);
}

main();
