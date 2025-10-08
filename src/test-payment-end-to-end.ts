/**
 * End-to-end test for the complete payment flow
 * This script tests the entire payment process from order creation to verification
 */

import { connectToDatabase } from '@/lib/db/connection';
import { PaymentService } from '@/lib/payment/payment';
import crypto from 'crypto';

async function testEndToEndPaymentFlow() {
  try {
    console.log('🚀 Starting end-to-end payment flow test...\n');
    
    // Test data
    const testData = {
      userId: "test_user_123",
      stationId: "test_station_456",
      slotId: "test_slot_789",
      amount: 100,
      duration: 2,
      currency: 'INR',
      method: 'Razorpay',
      orderId: `order_${Date.now()}` // Add required orderId field
    };
    
    console.log('📋 Test data:', testData);
    
    // Step 1: Test payment record creation
    console.log('\n--- Step 1: Creating payment record ---');
    const paymentRecord = await PaymentService.createPayment(testData);
    console.log('✅ Payment record created:', {
      id: paymentRecord.id,
      orderId: paymentRecord.orderId,
      userId: paymentRecord.userId,
      amount: paymentRecord.amount,
      status: paymentRecord.status
    });
    
    // Step 2: Simulate Razorpay order creation (mock)
    console.log('\n--- Step 2: Simulating Razorpay order creation ---');
    const mockOrderId = paymentRecord.orderId; // Use the actual orderId from the created record
    const mockPaymentId = `pay_${Date.now()}`;
    const mockSignature = 'mock_signature';
    
    console.log('✅ Mock Razorpay order created:', {
      orderId: mockOrderId,
      paymentId: mockPaymentId,
      signature: mockSignature
    });
    
    // Step 3: Test signature verification
    console.log('\n--- Step 3: Testing signature verification ---');
    
    // Set up mock environment variable for testing
    process.env['RAZORPAY_KEY_SECRET'] = 'test_secret_key';
    
    // Create a valid signature for testing
    const validSignature = crypto
      .createHmac('sha256', process.env['RAZORPAY_KEY_SECRET'])
      .update(`${mockOrderId}|${mockPaymentId}`)
      .digest('hex');
    
    console.log('🔐 Generated valid signature:', validSignature);
    
    const isVerified = await PaymentService.verifyRazorpaySignature(
      mockOrderId,
      mockPaymentId,
      validSignature
    );
    
    console.log('✅ Signature verification result:', isVerified ? 'SUCCESS' : 'FAILED');
    
    if (!isVerified) {
      throw new Error('Signature verification failed');
    }
    
    // Step 4: Test payment status update
    console.log('\n--- Step 4: Testing payment status update ---');
    const updatedPayment = await PaymentService.updatePaymentStatus(
      mockOrderId,
      mockPaymentId,
      'completed'
    );
    
    console.log('✅ Payment status updated:', {
      orderId: updatedPayment?.orderId,
      paymentId: updatedPayment?.paymentId,
      status: updatedPayment?.status
    });
    
    if (!updatedPayment) {
      throw new Error('Payment status update failed');
    }
    
    // Step 5: Test payment history retrieval
    console.log('\n--- Step 5: Testing payment history retrieval ---');
    const paymentHistory = await PaymentService.getPaymentHistory(testData.userId);
    console.log('✅ Payment history retrieved:', paymentHistory.length, 'records');
    
    // Step 6: Test all payment history retrieval
    console.log('\n--- Step 6: Testing all payment history retrieval ---');
    const allPaymentHistory = await PaymentService.getAllPaymentHistory(testData.userId);
    console.log('✅ All payment history retrieved:', allPaymentHistory.length, 'records');
    
    console.log('\n🎉 All end-to-end tests passed successfully!');
    console.log('✅ Payment flow is working correctly');
    
  } catch (error: any) {
    console.error('\n❌ End-to-end test failed:', error);
    console.error('Error details:', error.message);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testEndToEndPaymentFlow().then(() => {
    console.log('\n--- Test completed ---');
  });
}

export default testEndToEndPaymentFlow;