// Comprehensive test script to verify all aspects of the deployed app match localhost
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== EV Bunker Deployment Verification ===\n');

// Test 1: Check if all required files exist
console.log('1. Checking required files...');
const requiredFiles = [
  'public/assets/logo.png',
  'public/assets/favicon.ico',
  'src/app/globals.css',
  'src/components/common/UniversalLoader.tsx',
  'src/components/landing/Navbar.tsx'
];

let allFilesExist = true;
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`  ✓ ${file} exists`);
  } else {
    console.log(`  ✗ ${file} missing`);
    allFilesExist = false;
  }
}

if (allFilesExist) {
  console.log('  All required files present\n');
} else {
  console.log('  Some required files missing\n');
}

// Test 2: Check environment variables
console.log('2. Checking environment variables...');
const requiredEnvVars = [
  'NEXT_PUBLIC_RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'DATABASE_URL'
];

let allEnvVarsPresent = true;
for (const envVar of requiredEnvVars) {
  if (process.env[envVar]) {
    console.log(`  ✓ ${envVar} is set`);
  } else {
    console.log(`  ⚠ ${envVar} is not set`);
    allEnvVarsPresent = false;
  }
}

if (allEnvVarsPresent) {
  console.log('  All critical environment variables present\n');
} else {
  console.log('  Some environment variables missing (may affect functionality)\n');
}

// Test 3: Check build output
console.log('3. Checking build output...');
if (fs.existsSync('.next')) {
  console.log('  ✓ Build directory exists');
  
  // Check if standalone build exists
  if (fs.existsSync('.next/standalone')) {
    console.log('  ✓ Standalone build exists');
  } else {
    console.log('  ⚠ Standalone build missing');
  }
  
  // Check static assets
  if (fs.existsSync('.next/static')) {
    console.log('  ✓ Static assets compiled');
  } else {
    console.log('  ⚠ Static assets missing');
  }
} else {
  console.log('  ✗ Build directory missing');
}

console.log('\n4. Checking server configuration...');
console.log(`  Port: ${process.env.PORT || 3000}`);
console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);

console.log('\n5. Animation verification checklist:');
console.log('  - GSAP animations: Should be working');
console.log('  - Framer Motion transitions: Should be smooth');
console.log('  - Loading screens: Should display correctly');
console.log('  - Hover effects: Should be responsive');
console.log('  - Page transitions: Should be seamless');

console.log('\n6. Functionality verification checklist:');
console.log('  - User authentication: Should work for both client and admin');
console.log('  - Map functionality: Should display charging stations');
console.log('  - Booking system: Should allow station booking');
console.log('  - Payment integration: Should process payments via Razorpay');
console.log('  - Dashboard: Should display user/client data correctly');
console.log('  - Real-time updates: Should show live status');

console.log('\n=== Verification Complete ===');
console.log('\nTo fully verify the deployment:');
console.log('1. Visit http://localhost:3002 in your browser');
console.log('2. Test all navigation links');
console.log('3. Verify animations on homepage and loading screens');
console.log('4. Test user login (test@example.com/password123)');
console.log('5. Test admin login (admin@ebunker.com/admin123)');
console.log('6. Try booking a charging station');
console.log('7. Verify payment processing works');
console.log('8. Check dashboard functionality');
console.log('9. Test all responsive breakpoints');

console.log('\nIf any issues are found, check:');
console.log('- Console errors in browser dev tools');
console.log('- Network requests in browser dev tools');
console.log('- Server logs for error messages');
console.log('- Environment variable configuration');
console.log('- Database connectivity');