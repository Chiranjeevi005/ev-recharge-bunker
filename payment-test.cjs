// Payment integration test
require('dotenv').config({ path: '.env.local' });

const Razorpay = require('razorpay');

async function testPaymentIntegration() {
  console.log('🧪 Testing payment integration...\n');
  
  // Test 1: Check environment variables
  console.log('1. Checking environment variables...');
  try {
    const requiredVars = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];
    const missingVars = [];
    
    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    });
    
    if (missingVars.length > 0) {
      console.log('   ⚠️ Missing environment variables:', missingVars);
      return false;
    } else {
      console.log('   ✅ All required environment variables are present');
      console.log('   Razorpay Key ID:', process.env.RAZORPAY_KEY_ID);
      // Don't log the secret for security
    }
    
    console.log('   ✅ Environment variables check completed\n');
  } catch (error) {
    console.error('   ❌ Environment variables check failed:', error.message, '\n');
    return false;
  }
  
  // Test 2: Initialize Razorpay
  console.log('2. Initializing Razorpay...');
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    
    console.log('   ✅ Razorpay initialized successfully\n');
  } catch (error) {
    console.error('   ❌ Razorpay initialization failed:', error.message, '\n');
    return false;
  }
  
  // Test 3: Create a test order
  console.log('3. Creating test payment order...');
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    
    // Create a small test order (₹1)
    const order = await razorpay.orders.create({
      amount: 100, // 100 paise = ₹1
      currency: 'INR',
      receipt: `test_receipt_${Date.now()}`
    });
    
    console.log('   ✅ Test order created successfully');
    console.log('   Order ID:', order.id);
    console.log('   Amount:', order.amount);
    console.log('   Currency:', order.currency);
    
    console.log('   ✅ Payment integration test completed\n');
    return true;
  } catch (error) {
    console.error('   ❌ Test order creation failed:', error.message);
    if (error.statusCode) {
      console.error('   Status code:', error.statusCode);
    }
    if (error.error) {
      console.error('   Error details:', JSON.stringify(error.error, null, 2));
    }
    console.log('');
    return false;
  }
}

testPaymentIntegration().then((success) => {
  if (success) {
    console.log('🎉 Payment integration test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Environment variables: ✅ Configured correctly');
    console.log('   - Razorpay initialization: ✅ Working');
    console.log('   - Test order creation: ✅ Successful');
    console.log('\n🚀 Payment integration should work correctly in the deployed application!');
  } else {
    console.log('❌ Payment integration test failed!');
    console.log('\nPlease check the error messages above and ensure:');
    console.log('1. Razorpay API keys are correctly configured in .env.local');
    console.log('2. The keys have the correct permissions');
    console.log('3. There are no network connectivity issues');
  }
  
  process.exit(success ? 0 : 1);
}).catch((error) => {
  console.error('💥 Test failed with unhandled error:', error);
  process.exit(1);
});