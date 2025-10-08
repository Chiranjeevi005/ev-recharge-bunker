import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function GET() {
  try {
    // Check environment variables
    const keyId = process.env['RAZORPAY_KEY_ID'];
    const keySecret = process.env['RAZORPAY_KEY_SECRET'];
    const publicKeyId = process.env['NEXT_PUBLIC_RAZORPAY_KEY_ID'];
    
    const envCheck = {
      RAZORPAY_KEY_ID: !!keyId && keyId.trim() !== '' && keyId.trim() !== 'rzp_test_example',
      RAZORPAY_KEY_SECRET: !!keySecret && keySecret.trim() !== '' && keySecret.trim() !== 'test_secret',
      NEXT_PUBLIC_RAZORPAY_KEY_ID: !!publicKeyId && publicKeyId.trim() !== '' && publicKeyId.trim() !== 'rzp_test_example'
    };
    
    const allEnvVarsSet = Object.values(envCheck).every(Boolean);
    
    // Try to initialize Razorpay
    let razorpayInitSuccess = false;
    let razorpayError = null;
    
    try {
      if (allEnvVarsSet && keyId && keySecret) {
        const razorpay = new Razorpay({
          key_id: keyId.trim(),
          key_secret: keySecret.trim()
        });
        razorpayInitSuccess = !!razorpay;
      }
    } catch (error: any) {
      razorpayError = error.message;
    }
    
    // Overall status
    const overallSuccess = allEnvVarsSet && razorpayInitSuccess;
    
    return NextResponse.json({
      success: overallSuccess,
      timestamp: new Date().toISOString(),
      environment: {
        variables: envCheck,
        allSet: allEnvVarsSet
      },
      razorpay: {
        initialized: razorpayInitSuccess,
        error: razorpayError
      },
      message: overallSuccess 
        ? '✅ All payment services are properly configured and working!' 
        : '❌ Payment services need attention. Check details below.'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}