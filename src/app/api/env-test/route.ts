import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
  const keyId = process.env['RAZORPAY_KEY_ID'];
  const keySecret = process.env['RAZORPAY_KEY_SECRET'];
  
  return NextResponse.json({
    keyId: keyId ? 'SET' : 'NOT SET',
    keySecret: keySecret ? 'SET' : 'NOT SET',
    keyIdValue: keyId,
    keySecretValue: keySecret ? 'SET (hidden for security)' : 'NOT SET'
  });
}
