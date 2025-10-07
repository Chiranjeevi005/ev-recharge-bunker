#!/usr/bin/env node

// Simple environment variable validation script
console.log('🔍 Validating environment variables...');

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

const missingVars = [];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    missingVars.push(envVar);
  }
}

if (missingVars.length > 0) {
  console.warn('⚠️  Warning: Missing environment variables:');
  missingVars.forEach(envVar => console.warn(`   - ${envVar}`));
  console.warn('\nPlease set these variables in your .env.local file for production deployment.');
} else {
  console.log('✅ All required environment variables are present.');
}

// Check for Redis (optional but recommended)
if (!process.env.REDIS_URL) {
  console.log('ℹ️  Note: REDIS_URL not set. Real-time features will be disabled.');
}

console.log('✅ Environment validation complete.');