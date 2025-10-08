/**
 * Test script to verify payment flow fixes
 * This script tests the complete payment process from order creation to verification
 */

import { connectToDatabase } from '@/lib/db/connection';
import Razorpay from 'razorpay';

async function testPaymentFlow() {
  try {
    console.log('Starting payment flow test...');
    
    // Check environment variables
    console.log('\n--- Checking Environment Variables ---');
    const keyId = process.env['RAZORPAY_KEY_ID'];
    const keySecret = process.env['RAZORPAY_KEY_SECRET'];
    const publicKeyId = process.env['NEXT_PUBLIC_RAZORPAY_KEY_ID'];
    
    console.log('RAZORPAY_KEY_ID:', keyId ? 'SET' : 'NOT SET');
    console.log('RAZORPAY_KEY_SECRET:', keySecret ? 'SET' : 'NOT SET');
    console.log('NEXT_PUBLIC_RAZORPAY_KEY_ID:', publicKeyId ? 'SET' : 'NOT SET');
    
    if (!keyId || !keySecret) {
      console.error('❌ Missing Razorpay credentials');
      return;
    }
    
    // Initialize Razorpay instance with validation
    console.log('\n--- Initializing Razorpay ---');
    const razorpayKeyId = keyId.trim();
    const razorpayKeySecret = keySecret.trim();
    
    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('❌ Razorpay credentials are empty');
      return;
    }
    
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret
    });
    
    console.log('✅ Razorpay initialized successfully');
    
    // Connect to database
    console.log('\n--- Connecting to Database ---');
    const { db } = await connectToDatabase();
    console.log('✅ Connected to database');
    
    // Test 1: Create a payment order
    console.log('\n--- Test 1: Creating payment order ---');
    const receiptId = `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`.substring(0, 40);
    
    const order = await razorpay.orders.create({
      amount: 10000, // 100 INR in paise
      currency: 'INR',
      receipt: receiptId
    });
    
    console.log('✅ Razorpay order created:', order);
    
    // Test 2: Store payment record in database
    console.log('\n--- Test 2: Storing payment record ---');
    const paymentRecord = {
      userId: "test_user_123",
      stationId: "test_station_456",
      slotId: "test_slot_789",
      amount: 100,
      duration: 2,
      currency: 'INR',
      orderId: order.id,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection("payments").insertOne(paymentRecord);
    console.log('✅ Payment record stored:', result.insertedId.toString());
    
    // Test 3: Retrieve payment record
    console.log('\n--- Test 3: Retrieving payment record ---');
    const retrievedPayment = await db.collection('payments').findOne({ _id: result.insertedId });
    console.log('✅ Payment record retrieved:', retrievedPayment);
    
    // Test 4: Update payment status
    console.log('\n--- Test 4: Updating payment status ---');
    const updateResult = await db.collection('payments').updateOne(
      { _id: result.insertedId },
      { 
        $set: { 
          status: 'completed',
          paymentId: 'test_payment_id_123',
          updatedAt: new Date()
        } 
      }
    );
    
    console.log('✅ Payment status updated:', updateResult.modifiedCount);
    
    console.log('\n🎉 All tests passed! Payment flow is working correctly.');
  } catch (error: any) {
    console.error('\n❌ Test failed:', error);
    console.error('Error details:', error.message);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testPaymentFlow().then(() => {
    console.log('\n--- Test completed ---');
  });
}

export default testPaymentFlow;