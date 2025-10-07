import { NextResponse } from 'next/server';

export async function GET() {
  // Check if environment variables are set
  const keyIdSet = !!process.env['RAZORPAY_KEY_ID'];
  const keySecretSet = !!process.env['RAZORPAY_KEY_SECRET'];
  const publicKeyIdSet = !!process.env['NEXT_PUBLIC_RAZORPAY_KEY_ID'];
  
  // Get the actual values (first few characters for security)
  const keyIdValue = process.env['RAZORPAY_KEY_ID'] ? 
    process.env['RAZORPAY_KEY_ID'].substring(0, 10) + '...' : 'NOT SET';
  const keySecretValue = process.env['RAZORPAY_KEY_SECRET'] ? 
    process.env['RAZORPAY_KEY_SECRET'].substring(0, 10) + '...' : 'NOT SET';
  const publicKeyIdValue = process.env['NEXT_PUBLIC_RAZORPAY_KEY_ID'] ? 
    process.env['NEXT_PUBLIC_RAZORPAY_KEY_ID'].substring(0, 10) + '...' : 'NOT SET';
  
  // Try to initialize Razorpay
  let razorpayInitialized = false;
  let razorpayError = null;
  let orderTestResult = null;
  
  try {
    if (keyIdSet && keySecretSet) {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: process.env['RAZORPAY_KEY_ID'],
        key_secret: process.env['RAZORPAY_KEY_SECRET']
      });
      razorpayInitialized = true;
      
      // Test creating an order
      try {
        const order = await razorpay.orders.create({
          amount: 10000, // 100 INR in paise
          currency: 'INR',
          receipt: 'receipt_debug_test'
        });
        orderTestResult = {
          success: true,
          orderId: order.id,
          amount: order.amount
        };
      } catch (orderError: any) {
        orderTestResult = {
          success: false,
          error: orderError.message,
          statusCode: orderError.statusCode,
          errorDetails: orderError.error
        };
      }
    }
  } catch (error: any) {
    razorpayError = error.message;
  }
  
  return NextResponse.json({
    success: keyIdSet && keySecretSet && razorpayInitialized,
    config: {
      RAZORPAY_KEY_ID: keyIdValue,
      RAZORPAY_KEY_SECRET: keySecretValue,
      NEXT_PUBLIC_RAZORPAY_KEY_ID: publicKeyIdValue
    },
    razorpay: {
      initialized: razorpayInitialized,
      error: razorpayError,
      orderTest: orderTestResult
    }
  });
}