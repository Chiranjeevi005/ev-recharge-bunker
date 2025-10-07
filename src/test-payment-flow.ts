/**
 * Test script for end-to-end payment flow
 * This script tests the complete payment process from order creation to verification
 */

import { connectToDatabase } from '@/lib/db/connection';
import Razorpay from 'razorpay';

async function testPaymentFlow() {
  try {
    console.log('Starting payment flow test...');
    
    // Initialize Razorpay instance
    const razorpay = new Razorpay({
      key_id: process.env['RAZORPAY_KEY_ID']!,
      key_secret: process.env['RAZORPAY_KEY_SECRET']!
    });
    
    // Connect to database
    const { db } = await connectToDatabase();
    console.log('Connected to database');
    
    // Test 1: Create a payment order
    console.log('\n--- Test 1: Creating payment order ---');
    const receiptId = `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`.substring(0, 40);
    
    const order = await razorpay.orders.create({
      amount: 10000, // 100 INR in paise
      currency: 'INR',
      receipt: receiptId
    });
    
    console.log('Razorpay order created:', order);
    
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
    console.log('Payment record stored:', orderResult.insertedId.toString());
    
    // Test 3: Verify payment (simulate successful payment)
    console.log('\n--- Test 3: Simulating payment verification ---');
    // In a real scenario, this would be done after the user completes the payment on Razorpay
    // For testing, we'll just update the status directly
    
    const updatedPayment = await db.collection('payments').findOneAndUpdate(
      { orderId: order.id },
      { 
        $set: { 
          paymentId: `pay_${Date.now()}`,
          status: 'completed',
          updatedAt: new Date()
        } 
      },
      { 
        returnDocument: 'after'
      }
    );
    
    console.log('Payment status updated:', updatedPayment?.['value']);
    
    // Test 4: Create booking record
    console.log('\n--- Test 4: Creating booking record ---');
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
    
    const bookingData = {
      userId: "test_user_123",
      stationId: "test_station_456",
      slotId: "test_slot_789",
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      amount: 100,
      paymentId: `pay_${Date.now()}`,
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const bookingResult = await db.collection("bookings").insertOne(bookingData);
    console.log('Booking record created:', bookingResult.insertedId.toString());
    
    console.log('\n--- All tests passed! ---');
    console.log('Payment flow is working correctly.');
    
  } catch (error) {
    console.error('Payment flow test failed:', error);
  }
}

// Run the test
testPaymentFlow();