import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { PaymentService } from '@/lib/payment';

export async function GET() {
  try {
    // Test the updatePaymentStatus method directly
    const testOrderId = `test_order_${Date.now()}`;
    const testPaymentId = `test_payment_${Date.now()}`;
    
    const { db } = await connectToDatabase();
    
    // Create a test payment record
    const paymentRecord = {
      userId: "test-user",
      stationId: "test-station",
      slotId: "test-slot",
      amount: 100,
      duration: 1,
      currency: 'INR',
      orderId: testOrderId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection("payments").insertOne(paymentRecord);
    
    // Test updating the payment status
    const updatedPayment = await PaymentService.updatePaymentStatus(
      testOrderId,
      testPaymentId,
      'completed'
    );
    
    if (!updatedPayment) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update payment status'
      }, { status: 500 });
    }
    
    // Verify the update
    const verifiedPayment = await db.collection("payments").findOne({ 
      orderId: testOrderId 
    });
    
    return NextResponse.json({
      success: true,
      message: 'Payment verification test successful',
      originalRecord: paymentRecord,
      updatedRecord: updatedPayment,
      verifiedRecord: verifiedPayment
    });
  } catch (error) {
    console.error('Payment verification test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Payment verification test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}