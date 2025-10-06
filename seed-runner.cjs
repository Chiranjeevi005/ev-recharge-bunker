// Simple script to run the seed functionality
const { execSync } = require('child_process');

try {
  // Run the seed script using ts-node
  execSync('npx ts-node seed.ts', { stdio: 'inherit' });
  console.log('Seed script completed successfully');
} catch (error) {
  console.error('Seed script failed:', error.message);
  process.exit(1);
}