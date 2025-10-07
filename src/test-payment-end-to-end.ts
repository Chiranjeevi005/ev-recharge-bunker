/**
 * Comprehensive end-to-end payment flow test
 * This script tests the complete payment process from order creation to verification
 */

import { connectToDatabase } from '@/lib/db/connection';
import Razorpay from 'razorpay';

async function testEndToEndPaymentFlow() {
  try {
    console.log('🚀 Starting comprehensive end-to-end payment flow test...');
    
    // Initialize Razorpay instance
    const razorpay = new Razorpay({
      key_id: process.env['RAZORPAY_KEY_ID']!,
      key_secret: process.env['RAZORPAY_KEY_SECRET']!
    });
    
    // Connect to database
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
    
    const orderResult = await db.collection("payments").insertOne(paymentRecord);
    console.log('✅ Payment record stored with ID:', orderResult.insertedId.toString());
    
    // Test 3: Verify payment (simulate successful payment)
    console.log('\n--- Test 3: Simulating payment verification ---');
    
    // Create a mock signature for testing
    const crypto = require('crypto');
    const secret = process.env['RAZORPAY_KEY_SECRET']!;
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(`${order.id}|mock_payment_id_123`);
    const mockSignature = shasum.digest('hex');
    
    console.log('Mock signature for testing:', mockSignature);
    
    // Test 4: Test signature verification function
    console.log('\n--- Test 4: Testing signature verification ---');
    const { PaymentService } = await import('@/lib/payment/payment');
    
    const isVerified = await PaymentService.verifyRazorpaySignature(
      order.id,
      'mock_payment_id_123',
      mockSignature
    );
    
    console.log('✅ Signature verification result:', isVerified);
    
    if (!isVerified) {
      console.error('❌ Signature verification failed');
      return;
    }
    
    // Test 5: Update payment status
    console.log('\n--- Test 5: Updating payment status ---');
    const updatedPayment = await PaymentService.updatePaymentStatus(
      order.id,
      'mock_payment_id_123',
      'completed'
    );
    
    console.log('✅ Payment status updated:', updatedPayment);
    
    if (!updatedPayment) {
      console.error('❌ Failed to update payment status');
      return;
    }
    
    // Test 6: Create booking record
    console.log('\n--- Test 6: Creating booking record ---');
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
    
    const bookingData = {
      userId: "test_user_123",
      stationId: "test_station_456",
      slotId: "test_slot_789",
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      amount: 100,
      paymentId: 'mock_payment_id_123',
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const bookingResult = await db.collection("bookings").insertOne(bookingData);
    console.log('✅ Booking record created with ID:', bookingResult.insertedId.toString());
    
    // Test 7: Verify payment history functions
    console.log('\n--- Test 7: Testing payment history functions ---');
    const recentPayments = await PaymentService.getPaymentHistory("test_user_123");
    console.log('✅ Recent payments retrieved:', recentPayments.length);
    
    const allPayments = await PaymentService.getAllPaymentHistory("test_user_123");
    console.log('✅ All payments retrieved:', allPayments.length);
    
    console.log('\n--- All tests passed! ---');
    console.log('✅ Payment flow is working correctly.');
    console.log('\n📋 Summary:');
    console.log('  ✅ Razorpay order creation: Working');
    console.log('  ✅ Database storage: Working');
    console.log('  ✅ Signature verification: Working');
    console.log('  ✅ Payment status update: Working');
    console.log('  ✅ Booking creation: Working');
    console.log('  ✅ Payment history: Working');
    
  } catch (error) {
    console.error('❌ Payment flow test failed:', error);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('  1. Verify Razorpay keys are correct');
    console.log('  2. Check if keys have proper permissions');
    console.log('  3. Ensure network connectivity to Razorpay API');
    console.log('  4. Check database connection');
    console.log('  5. Verify environment variables are set');
  }
}

// Run the test
testEndToEndPaymentFlow();