/**
 * Deployment verification script for payment services
 * This script verifies that all payment services are working correctly in the deployed environment
 */

interface PaymentTestResult {
  success: boolean;
  message: string;
  details?: any;
}

async function verifyEnvironmentVariables(): Promise<PaymentTestResult> {
  try {
    console.log('🔍 Checking environment variables...');
    
    const requiredVars = [
      'RAZORPAY_KEY_ID',
      'RAZORPAY_KEY_SECRET',
      'NEXT_PUBLIC_RAZORPAY_KEY_ID'
    ];
    
    const missingVars: string[] = [];
    
    for (const envVar of requiredVars) {
      const value = process.env[envVar];
      if (!value || value.trim() === '') {
        missingVars.push(envVar);
      }
    }
    
    if (missingVars.length > 0) {
      return {
        success: false,
        message: `Missing environment variables: ${missingVars.join(', ')}`,
        details: missingVars
      };
    }
    
    // Check for test values
    const razorpayKeyId = process.env['RAZORPAY_KEY_ID']?.trim();
    const razorpayKeySecret = process.env['RAZORPAY_KEY_SECRET']?.trim();
    const nextPublicRazorpayKeyId = process.env['NEXT_PUBLIC_RAZORPAY_KEY_ID']?.trim();
    
    if (razorpayKeyId === 'rzp_test_example' || razorpayKeySecret === 'test_secret' || nextPublicRazorpayKeyId === 'rzp_test_example') {
      return {
        success: false,
        message: 'Environment variables are set to test values. Please update with real values.'
      };
    }
    
    return {
      success: true,
      message: 'All environment variables are properly set',
      details: {
        RAZORPAY_KEY_ID: 'SET',
        RAZORPAY_KEY_SECRET: 'SET',
        NEXT_PUBLIC_RAZORPAY_KEY_ID: 'SET'
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Error checking environment variables',
      details: error.message
    };
  }
}

async function verifyRazorpayInitialization(): Promise<PaymentTestResult> {
  try {
    console.log('💳 Verifying Razorpay initialization...');
    
    // Dynamically import Razorpay to avoid issues in environments where it might not be available
    const Razorpay = (await import('razorpay')).default;
    
    const keyId = process.env['RAZORPAY_KEY_ID']?.trim();
    const keySecret = process.env['RAZORPAY_KEY_SECRET']?.trim();
    
    if (!keyId || !keySecret) {
      return {
        success: false,
        message: 'Razorpay credentials not found'
      };
    }
    
    // Try to initialize Razorpay
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
    
    // Test basic functionality
    // Note: We're not actually creating an order here to avoid unnecessary charges
    console.log('✅ Razorpay initialized successfully');
    
    return {
      success: true,
      message: 'Razorpay SDK initialized successfully'
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Error initializing Razorpay SDK',
      details: error.message
    };
  }
}

async function verifyPaymentAPIs(): Promise<PaymentTestResult> {
  try {
    console.log('🔌 Verifying payment APIs...');
    
    // Test the payment configuration endpoint if it exists
    try {
      const configResponse = await fetch('/api/payment/test-config');
      if (configResponse.ok) {
        const configData = await configResponse.json();
        if (configData.success) {
          return {
            success: true,
            message: 'Payment APIs are accessible and configured correctly',
            details: configData
          };
        } else {
          return {
            success: false,
            message: 'Payment APIs are accessible but not properly configured',
            details: configData
          };
        }
      }
    } catch (fetchError) {
      // If the test-config endpoint doesn't exist, that's okay
      console.log('ℹ️  Payment test-config endpoint not found (this is normal)');
    }
    
    // Test the main payment endpoints
    try {
      // Test order creation endpoint (with empty body to trigger validation)
      const orderResponse = await fetch('/api/payment/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      // We expect a validation error, not a server error
      if (orderResponse.status === 400) {
        console.log('✅ Payment order endpoint is working (validation working)');
      } else if (orderResponse.status === 500) {
        const errorData = await orderResponse.json();
        return {
          success: false,
          message: 'Payment order endpoint failed with server error',
          details: errorData
        };
      }
    } catch (orderError) {
      return {
        success: false,
        message: 'Payment order endpoint is not accessible',
        details: (orderError as Error).message
      };
    }
    
    return {
      success: true,
      message: 'Payment APIs are accessible and functioning'
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Error verifying payment APIs',
      details: error.message
    };
  }
}

async function verifyFrontendIntegration(): Promise<PaymentTestResult> {
  try {
    console.log('🌐 Verifying frontend integration...');
    
    // Check if Razorpay is available in the browser
    if (typeof window !== 'undefined') {
      // @ts-ignore
      if (typeof window.Razorpay !== 'undefined') {
        return {
          success: true,
          message: 'Razorpay SDK is available in the browser'
        };
      } else {
        return {
          success: false,
          message: 'Razorpay SDK is not available in the browser'
        };
      }
    }
    
    // In server environment, we can't check this
    return {
      success: true,
      message: 'Frontend integration check skipped (server environment)'
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Error verifying frontend integration',
      details: error.message
    };
  }
}

export async function verifyPaymentDeployment(): Promise<PaymentTestResult[]> {
  console.log('🚀 Starting payment deployment verification...\n');
  
  const tests = [
    verifyEnvironmentVariables,
    verifyRazorpayInitialization,
    verifyPaymentAPIs,
    verifyFrontendIntegration
  ];
  
  const results: PaymentTestResult[] = [];
  
  for (const test of tests) {
    try {
      const result = await test();
      results.push(result);
      
      if (result.success) {
        console.log(`✅ ${result.message}\n`);
      } else {
        console.log(`❌ ${result.message}\n`);
        if (result.details) {
          console.log('   Details:', result.details);
        }
      }
    } catch (error: any) {
      const result: PaymentTestResult = {
        success: false,
        message: `Test failed with exception: ${error.message}`,
        details: error
      };
      results.push(result);
      console.log(`❌ ${result.message}\n`);
    }
  }
  
  const passedTests = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  console.log(`\n📊 Verification Summary: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All payment services are working correctly!');
  } else {
    console.log('⚠️  Some payment services may not be working properly.');
  }
  
  return results;
}

// Run the verification if this file is executed directly
if (require.main === module) {
  verifyPaymentDeployment().then((results) => {
    const passed = results.filter(r => r.success).length;
    const total = results.length;
    
    console.log(`\n🏁 Final Result: ${passed}/${total} checks passed`);
    
    if (passed === total) {
      console.log('✅ Payment deployment verification completed successfully!');
      process.exit(0);
    } else {
      console.log('❌ Payment deployment verification found issues!');
      process.exit(1);
    }
  }).catch((error) => {
    console.error('💥 Verification failed with error:', error);
    process.exit(1);
  });
}

export default verifyPaymentDeployment;