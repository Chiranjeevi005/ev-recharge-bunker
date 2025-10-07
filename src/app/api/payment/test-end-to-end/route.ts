import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import Razorpay from 'razorpay';
import { PaymentService } from '@/lib/payment/payment';

export async function POST(request: Request) {
  try {
    console.log('🚀 Starting end-to-end payment test...');
    
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
    const isVerified = await PaymentService.verifyRazorpaySignature(
      order.id,
      'mock_payment_id_123',
      mockSignature
    );
    
    console.log('✅ Signature verification result:', isVerified);
    
    if (!isVerified) {
      console.error('❌ Signature verification failed');
      return NextResponse.json(
        { success: false, error: 'Signature verification failed' },
        { status: 500 }
      );
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
      return NextResponse.json(
        { success: false, error: 'Failed to update payment status' },
        { status: 500 }
      );
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
    
    return NextResponse.json({
      success: true,
      message: 'All tests passed! Payment flow is working correctly.',
      orderId: order.id,
      paymentId: 'mock_payment_id_123',
      bookingId: bookingResult.insertedId.toString()
    });
    
  } catch (error: any) {
    console.error('❌ Payment flow test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Unknown error occurred',
        stack: error.stack
      },
      { status: 500 }
    );
  }
}