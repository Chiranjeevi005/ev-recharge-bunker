import { NextResponse } from 'next/server';

export async function GET() {
  // Check if environment variables are set
  const keyIdSet = !!process.env['RAZORPAY_KEY_ID'];
  const keySecretSet = !!process.env['RAZORPAY_KEY_SECRET'];
  const publicKeyIdSet = !!process.env['NEXT_PUBLIC_RAZORPAY_KEY_ID'];
  
  // Try to initialize Razorpay
  let razorpayInitialized = false;
  let razorpayError = null;
  
  try {
    if (keyIdSet && keySecretSet) {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: process.env['RAZORPAY_KEY_ID'],
        key_secret: process.env['RAZORPAY_KEY_SECRET']
      });
      razorpayInitialized = true;
    }
  } catch (error: any) {
    razorpayError = error.message;
  }
  
  return NextResponse.json({
    success: keyIdSet && keySecretSet && razorpayInitialized,
    config: {
      RAZORPAY_KEY_ID: keyIdSet ? 'SET' : 'NOT SET',
      RAZORPAY_KEY_SECRET: keySecretSet ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_RAZORPAY_KEY_ID: publicKeyIdSet ? 'SET' : 'NOT SET'
    },
    razorpay: {
      initialized: razorpayInitialized,
      error: razorpayError
    }
  });
}