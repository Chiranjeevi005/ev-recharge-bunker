import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function GET() {
  try {
    // Check if environment variables are set
    const keyIdSet = !!process.env['RAZORPAY_KEY_ID'];
    const keySecretSet = !!process.env['RAZORPAY_KEY_SECRET'];
    const publicKeyIdSet = !!process.env['NEXT_PUBLIC_RAZORPAY_KEY_ID'];
    
    // Try to initialize Razorpay
    let razorpayInitialized = false;
    let razorpayError = null;
    
    try {
      if (keyIdSet && keySecretSet) {
        const razorpay = new Razorpay({
          key_id: process.env['RAZORPAY_KEY_ID']!,
          key_secret: process.env['RAZORPAY_KEY_SECRET']!
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
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// Add a POST endpoint to test with actual data
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("TEST ENDPOINT - Received body:", body);
    
    // Simulate the validation that might be failing
    const testData = {
      userId: String(body.userId || 'anonymous'),
      stationId: String(body.stationId || ''),
      slotId: String(body.slotId || ''),
      duration: Math.max(1, Math.min(24, Number(body.duration) || 1)),
      amount: Math.max(1, Number(body.amount) || 1)
    };
    
    console.log("TEST ENDPOINT - Processed data:", testData);
    
    return NextResponse.json({
      success: true,
      received: body,
      processed: testData,
      message: "Data processed successfully"
    });
  } catch (error: any) {
    console.error("TEST ENDPOINT - Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}