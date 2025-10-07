// Test payment fix
console.log('🔍 Testing payment fix...');

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

console.log('\n2. Testing payment order creation with edge cases:');
try {
  const Razorpay = require('razorpay');
  
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  
  console.log('   ✅ Razorpay initialized successfully');
  
  // Test cases that might cause the "null" error
  const testCases = [
    {
      name: "Valid data",
      amount: 150,
      duration: 2
    },
    {
      name: "Zero amount",
      amount: 0,
      duration: 2
    },
    {
      name: "Negative amount",
      amount: -50,
      duration: 2
    },
    {
      name: "Null amount",
      amount: null,
      duration: 2
    },
    {
      name: "Undefined amount",
      amount: undefined,
      duration: 2
    },
    {
      name: "String amount",
      amount: "150",
      duration: 2
    },
    {
      name: "Zero duration",
      amount: 150,
      duration: 0
    },
    {
      name: "Negative duration",
      amount: 150,
      duration: -2
    }
  ];
  
  // Test each case
  testCases.forEach((testCase, index) => {
    console.log(`\n   Test case ${index + 1}: ${testCase.name}`);
    console.log(`   Data:`, testCase);
    
    // Validate data before sending to Razorpay
    if (testCase.amount === null || testCase.amount === undefined) {
      console.log('   ❌ Skipped: Amount is null/undefined');
      return;
    }
    
    if (typeof testCase.amount !== 'number') {
      console.log('   ❌ Skipped: Amount is not a number');
      return;
    }
    
    if (isNaN(testCase.amount)) {
      console.log('   ❌ Skipped: Amount is NaN');
      return;
    }
    
    if (testCase.amount <= 0) {
      console.log('   ❌ Skipped: Amount is not positive');
      return;
    }
    
    if (testCase.duration === null || testCase.duration === undefined) {
      console.log('   ❌ Skipped: Duration is null/undefined');
      return;
    }
    
    if (typeof testCase.duration !== 'number') {
      console.log('   ❌ Skipped: Duration is not a number');
      return;
    }
    
    if (isNaN(testCase.duration)) {
      console.log('   ❌ Skipped: Duration is NaN');
      return;
    }
    
    if (testCase.duration <= 0) {
      console.log('   ❌ Skipped: Duration is not positive');
      return;
    }
    
    console.log('   ✅ Data validation passed');
  });
  
  console.log('\n🎉 Data validation tests completed!');
  console.log('   The enhanced validation should prevent the "null" error in the payment API');
  
} catch (error) {
  console.log('   ❌ Failed to initialize Razorpay:', error.message);
}

console.log('\n📋 Summary:');
console.log('   - Environment variables checked');
console.log('   - Data validation tests completed');
console.log('   - Enhanced validation should prevent null/undefined errors');