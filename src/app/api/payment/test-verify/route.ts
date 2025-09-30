import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import crypto from 'crypto';
import { PaymentService } from '@/lib/payment';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { razorpay_order_id, razorpay_payment_id } = body;
    
    console.log("Test payment verification request received:", {
      razorpay_order_id,
      razorpay_payment_id
    });
    
    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      );
    }
    
    // Skip signature verification for testing
    console.log("Skipping signature verification for test");
    
    // Update payment status using the payment service
    console.log(`Updating payment status for orderId: '${razorpay_order_id}'`);
    const updatedPayment = await PaymentService.updatePaymentStatus(
      razorpay_order_id, 
      razorpay_payment_id, 
      'completed'
    );
    
    if (!updatedPayment) {
      console.error(`Failed to update payment status for orderId: '${razorpay_order_id}'`);
      return NextResponse.json(
        { error: "Failed to update payment status" }, 
        { status: 500 }
      );
    }
    
    console.log("Updated payment record:", updatedPayment);
    
    return NextResponse.json({
      success: true,
      payment: updatedPayment
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" }, 
      { status: 500 }
    );
  }
}