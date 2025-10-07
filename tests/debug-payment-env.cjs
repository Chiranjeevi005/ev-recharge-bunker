// Debug payment environment variables
console.log('🔍 Debugging payment environment variables...');

// Check if we're in a server environment
if (typeof window !== 'undefined') {
  console.log('❌ This script must be run on the server side');
  process.exit(1);
}

// Try to load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('\n1. Checking environment variables:');
console.log('   RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✅ Set' : '❌ Missing');
console.log('   RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅ Set' : '❌ Missing');

if (process.env.RAZORPAY_KEY_ID) {
  console.log('   RAZORPAY_KEY_ID value:', process.env.RAZORPAY_KEY_ID.substring(0, 10) + '...');
}

console.log('\n2. Testing Razorpay initialization:');
try {
  const Razorpay = require('razorpay');
  
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.log('   ❌ Cannot initialize Razorpay - missing environment variables');
    process.exit(1);
  }
  
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  
  console.log('   ✅ Razorpay initialized successfully');
  
  console.log('\n3. Testing basic API call:');
  razorpay.orders.all({ count: 1 })
    .then(response => {
      console.log('   ✅ Razorpay API connection successful');
      console.log('   Sample response keys:', Object.keys(response).join(', '));
    })
    .catch(error => {
      console.log('   ❌ Razorpay API connection failed:', error.message);
      if (error.statusCode) {
        console.log('   Status code:', error.statusCode);
      }
    });
  
} catch (error) {
  console.log('   ❌ Failed to initialize Razorpay:', error.message);
}

console.log('\n4. Checking for common issues:');
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID.startsWith('rzp_live')) {
  console.log('   ⚠️  Using live Razorpay keys - make sure they are correct');
} else if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID.startsWith('rzp_test')) {
  console.log('   ✅ Using test Razorpay keys');
} else if (process.env.RAZORPAY_KEY_ID) {
  console.log('   ⚠️  Razorpay key ID format is unusual:', process.env.RAZORPAY_KEY_ID);
}

console.log('\n📋 Summary:');
console.log('   - Environment variables:', process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET ? '✅ Configured' : '❌ Missing');
console.log('   - Razorpay initialization: Test completed above');
console.log('   - API connectivity: Test completed above');