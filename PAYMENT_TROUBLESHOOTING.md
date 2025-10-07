# Payment Integration Troubleshooting Guide

This guide helps diagnose and resolve common payment integration issues in the EV Bunker application.

## Common Payment Errors and Solutions

### 1. "Failed to create payment order with Razorpay"

**Error Message**: `Payment order creation failed: Failed to create payment order with Razorpay`

**Possible Causes and Solutions**:

#### a. Environment Variables Not Set
- **Issue**: Razorpay API keys are not configured in environment variables
- **Solution**: 
  1. Check that `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set in your environment
  2. For Vercel deployment, ensure these are set in the Vercel dashboard under Environment Variables
  3. For local development, ensure these are in your `.env.local` file

#### b. Invalid API Keys
- **Issue**: Razorpay API keys are incorrect or expired
- **Solution**:
  1. Verify your Razorpay API keys in the Razorpay dashboard
  2. Ensure you're using the correct keys (test vs live)
  3. Check that there are no extra spaces or characters in the keys

#### c. Network/Connectivity Issues
- **Issue**: Server cannot connect to Razorpay API
- **Solution**:
  1. Check your internet connection
  2. Verify that your server can reach external APIs
  3. Check firewall settings if deployed on a restricted network

#### d. Insufficient Amount Value
- **Issue**: The payment amount is less than the minimum allowed by Razorpay
- **Solution**:
  1. Ensure the amount is at least ₹1 (100 paise)
  2. Verify that the amount is correctly converted to paise (multiply by 100)

### 2. "Payment verification failed"

**Error Message**: `Payment verification failed`

**Possible Causes and Solutions**:

#### a. Signature Mismatch
- **Issue**: The Razorpay signature verification failed
- **Solution**:
  1. Verify that `RAZORPAY_KEY_SECRET` is correctly set
  2. Check that the frontend is sending the correct parameters
  3. Ensure no modifications are made to the payment response before verification

#### b. Order ID Mismatch
- **Issue**: The order ID in the verification request doesn't match the one created
- **Solution**:
  1. Check that the frontend is storing and sending the correct order ID
  2. Verify that the order ID is not being modified during the payment process

### 3. "Payment record not found"

**Error Message**: `Payment record not found`

**Possible Causes and Solutions**:

#### a. Database Issues
- **Issue**: The payment record was not stored in the database
- **Solution**:
  1. Check database connectivity
  2. Verify that the `payments` collection exists
  3. Check database logs for any errors during the insert operation

## Debugging Steps

### 1. Check Server Logs
Look for detailed error messages in your server logs:
- Vercel: Check the function logs in the Vercel dashboard
- Local: Check the terminal where you're running the development server

### 2. Verify Environment Variables
Create a simple test endpoint to verify that environment variables are correctly loaded:

```javascript
// Add this to a test API route
export async function GET() {
  return NextResponse.json({
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? 'SET' : 'NOT SET',
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? 'SET' : 'NOT SET'
  });
}
```

### 3. Test Razorpay Integration Directly
Create a simple test script to verify Razorpay integration:

```javascript
// test-razorpay.js
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

async function testRazorpay() {
  try {
    const order = await razorpay.orders.create({
      amount: 10000, // 100 INR in paise
      currency: 'INR',
      receipt: 'receipt#1'
    });
    console.log('Order created:', order);
  } catch (error) {
    console.error('Error creating order:', error);
  }
}

testRazorpay();
```

## Vercel-Specific Issues

### 1. Environment Variables Not Available
- **Issue**: Environment variables work locally but not on Vercel
- **Solution**:
  1. Ensure variables are added in the Vercel dashboard
  2. Check that you're using the correct environment (Production/Preview/Development)
  3. Redeploy your application after adding environment variables

### 2. Serverless Function Timeout
- **Issue**: Payment processing takes too long, causing function timeout
- **Solution**:
  1. Optimize database queries
  2. Consider using background jobs for non-critical operations
  3. Increase timeout if possible (Vercel has limits)

## Testing Payments

### 1. Using Test Keys
Razorpay provides test keys for development:
- Use test keys during development
- Test cards: 
  - Card Number: 4111 1111 1111 1111
  - Expiry: Any future date
  - CVV: 123
  - OTP: 123456

### 2. Testing Webhooks
To test webhooks locally:
1. Use ngrok to expose your local server
2. Set up the webhook URL in the Razorpay dashboard
3. Test with sample payloads

## Best Practices

### 1. Error Handling
Always implement proper error handling:
- Log errors with sufficient context
- Return user-friendly error messages
- Implement retry mechanisms for transient failures

### 2. Security
- Never expose secret keys in client-side code
- Validate all inputs
- Use HTTPS for all payment-related communications

### 3. Monitoring
- Implement logging for all payment operations
- Set up alerts for payment failures
- Monitor success rates and investigate anomalies

## Support Resources

1. Razorpay Documentation: https://razorpay.com/docs/
2. Razorpay API Reference: https://razorpay.com/docs/api/
3. Next.js API Routes: https://nextjs.org/docs/api-routes/introduction
4. Vercel Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables