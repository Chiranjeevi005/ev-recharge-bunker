import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    RAZORPAY_KEY_ID: process.env['RAZORPAY_KEY_ID'] ? 'SET' : 'NOT SET',
    RAZORPAY_KEY_SECRET: process.env['RAZORPAY_KEY_SECRET'] ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env['NEXT_PUBLIC_RAZORPAY_KEY_ID'] ? 'SET' : 'NOT SET',
    DATABASE_URL: process.env['DATABASE_URL'] ? 'SET' : 'NOT SET'
  });
}