// Debug payment order creation
console.log('🔍 Debugging payment order creation...');

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

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.log('   ❌ Cannot proceed - missing environment variables');
  process.exit(1);
}

console.log('\n2. Testing payment order creation with sample data:');
try {
  const Razorpay = require('razorpay');
  
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  
  console.log('   ✅ Razorpay initialized successfully');
  
  // Sample data that mimics what the frontend sends
  const sampleData = {
    stationId: "sample_station_id",
    slotId: "sample_slot_id",
    duration: 2, // 2 hours
    amount: 150, // ₹150
    userId: "sample_user_id"
  };
  
  console.log('   Sample data:', JSON.stringify(sampleData, null, 2));
  
  console.log('\n3. Creating test payment order:');
  razorpay.orders.create({
    amount: sampleData.amount * 100, // Amount in paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}_test`
  })
    .then(order => {
      console.log('   ✅ Payment order created successfully');
      console.log('   Order ID:', order.id);
      console.log('   Amount:', order.amount);
      console.log('   Currency:', order.currency);
      
      console.log('\n🎉 All tests passed! Payment integration should work correctly.');
    })
    .catch(error => {
      console.log('   ❌ Payment order creation failed:', error.message);
      if (error.statusCode) {
        console.log('   Status code:', error.statusCode);
      }
      if (error.error) {
        console.log('   Error details:', JSON.stringify(error.error, null, 2));
      }
      
      console.log('\n🔧 Troubleshooting steps:');
      console.log('   1. Verify Razorpay keys are correct');
      console.log('   2. Check if keys have proper permissions');
      console.log('   3. Ensure network connectivity to Razorpay API');
      console.log('   4. Check if there are any IP restrictions on your Razorpay account');
    });
  
} catch (error) {
  console.log('   ❌ Failed to initialize Razorpay:', error.message);
}

console.log('\n📋 Debug information:');
console.log('   - Environment variables checked above');
console.log('   - Razorpay initialization: Test completed above');
console.log('   - Payment order creation: Test in progress above');