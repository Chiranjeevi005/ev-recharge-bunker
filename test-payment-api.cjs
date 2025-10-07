// Test the payment API directly
console.log('🔍 Testing payment API directly...');

// Try to load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('\n1. Checking environment variables:');
console.log('   RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✅ Set' : '❌ Missing');
console.log('   RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅ Set' : '❌ Missing');

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.log('   ❌ Cannot proceed - missing environment variables');
  process.exit(1);
}

console.log('\n2. Testing payment order API:');
try {
  const https = require('https');
  
  // Test data that mimics what the frontend sends
  const testData = {
    stationId: "test_station_id",
    slotId: "test_slot_id",
    duration: 2, // 2 hours
    amount: 150, // ₹150
    userId: "test_user_id"
  };
  
  console.log('   Test data:', JSON.stringify(testData, null, 2));
  
  const postData = JSON.stringify(testData);
  
  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/payment/order',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`   Status Code: ${res.statusCode}`);
      console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);
      console.log(`   Response: ${data}`);
      
      try {
        const response = JSON.parse(data);
        if (res.statusCode === 200) {
          console.log('   ✅ Payment order API working correctly');
          console.log('   Order ID:', response.orderId);
        } else {
          console.log('   ❌ Payment order API failed');
          console.log('   Error:', response.error);
          console.log('   Details:', response.details);
        }
      } catch (parseError) {
        console.log('   ❌ Failed to parse response');
        console.log('   Raw response:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.log('   ❌ Request failed:', error.message);
  });
  
  req.write(postData);
  req.end();
  
} catch (error) {
  console.log('   ❌ Failed to test payment API:', error.message);
}