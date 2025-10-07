import { NextResponse } from 'next/server';

export async function GET() {
  // Test trimming of environment variables
  const originalKeyId = process.env['RAZORPAY_KEY_ID'];
  const trimmedKeyId = process.env['RAZORPAY_KEY_ID']?.trim();
  
  const originalKeySecret = process.env['RAZORPAY_KEY_SECRET'];
  const trimmedKeySecret = process.env['RAZORPAY_KEY_SECRET']?.trim();
  
  return NextResponse.json({
    original: {
      RAZORPAY_KEY_ID: originalKeyId,
      RAZORPAY_KEY_SECRET: originalKeySecret
    },
    trimmed: {
      RAZORPAY_KEY_ID: trimmedKeyId,
      RAZORPAY_KEY_SECRET: trimmedKeySecret
    },
    lengths: {
      originalKeyId: originalKeyId?.length,
      trimmedKeyId: trimmedKeyId?.length,
      originalKeySecret: originalKeySecret?.length,
      trimmedKeySecret: trimmedKeySecret?.length
    }
  });
}