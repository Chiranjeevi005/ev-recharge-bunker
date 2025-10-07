// Test Razorpay keys directly
console.log('🔍 Testing Razorpay keys directly...');

try {
  const Razorpay = require('razorpay');
  
  // Use the exact keys from the Vercel setup script
  const razorpay = new Razorpay({
    key_id: 'rzp_test_RPS4VC3EINUb3D',
    key_secret: '87TSpJ63uYMG4ZPpppQWFNQm'
  });
  
  console.log('✅ Razorpay initialized successfully');
  
  // Test creating an order
  console.log('\n📝 Testing order creation...');
  razorpay.orders.create({
    amount: 10000, // 100 INR in paise
    currency: 'INR',
    receipt: 'receipt_test_123'
  })
    .then(order => {
      console.log('✅ Order created successfully!');
      console.log('   Order ID:', order.id);
      console.log('   Amount:', order.amount);
      console.log('   Status:', order.status);
      
      console.log('\n🎉 All tests passed! Razorpay keys are working correctly.');
    })
    .catch(error => {
      console.log('❌ Order creation failed:', error.message);
      if (error.statusCode) {
        console.log('   Status code:', error.statusCode);
      }
      if (error.error) {
        console.log('   Error details:', JSON.stringify(error.error, null, 2));
      }
    });
  
} catch (error) {
  console.log('❌ Failed to initialize Razorpay:', error.message);
}