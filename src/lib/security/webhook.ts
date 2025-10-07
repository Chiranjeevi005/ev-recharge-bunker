import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Verify webhook signature for services like Razorpay, Stripe, etc.
 * @param payload - The raw request body
 * @param signature - The signature from the request headers
 * @param secret - The webhook secret
 * @param algorithm - The algorithm to use (default: sha256)
 * @returns boolean - Whether the signature is valid
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string,
  algorithm: string = 'sha256'
): boolean {
  try {
    // Handle both string and buffer payloads
    const payloadBuffer = typeof payload === 'string' ? Buffer.from(payload) : payload;
    
    const expectedSignature = crypto
      .createHmac(algorithm, secret)
      .update(payloadBuffer)
      .digest('hex');
    
    // Check if signature is a valid hex string before attempting comparison
    if (!/^[0-9a-fA-F]+$/.test(signature)) {
      return false;
    }
    
    // Compare signatures safely
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Verify Razorpay webhook signature
 * @param payload - The raw request body
 * @param signature - The signature from the x-razorpay-signature header
 * @param secret - The Razorpay webhook secret
 * @returns boolean - Whether the signature is valid
 */
export function verifyRazorpayWebhook(
  payload: string | Buffer,
  signature: string,
  secret: string
): boolean {
  return verifyWebhookSignature(payload, signature, secret, 'sha256');
}

/**
 * Verify Stripe webhook signature
 * @param payload - The raw request body
 * @param signature - The signature from the Stripe-Signature header
 * @param secret - The Stripe webhook secret
 * @returns boolean - Whether the signature is valid
 */
export function verifyStripeWebhook(
  payload: string | Buffer,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    const signatureHash = `v1=${expectedSignature}`;
    
    // Check if both signatures are valid before attempting comparison
    if (typeof signature !== 'string' || typeof signatureHash !== 'string') {
      return false;
    }
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(signatureHash)
    );
  } catch (error) {
    console.error('Error verifying Stripe webhook signature:', error);
    return false;
  }
}

/**
 * Middleware to verify webhook signatures
 * @param secret - The webhook secret
 * @param signatureHeader - The header name containing the signature
 * @param algorithm - The algorithm to use (default: sha256)
 */
export function withWebhookVerification(
  secret: string,
  signatureHeader: string = 'x-webhook-signature',
  algorithm: string = 'sha256'
) {
  return async function middleware(request: NextRequest) {
    try {
      // Get the signature from headers
      const signature = request.headers.get(signatureHeader);
      
      if (!signature) {
        return NextResponse.json(
          { error: 'Missing webhook signature' },
          { status: 401 }
        );
      }
      
      // Get the raw body
      const body = await request.text();
      
      // Verify the signature
      const isValid = verifyWebhookSignature(body, signature, secret, algorithm);
      
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        );
      }
      
      // Add the parsed body to the request for downstream handlers
      // Note: This is a simplified approach - in a real implementation you might
      // want to use a more sophisticated method to pass the parsed body
      
      // Continue to the next middleware or route handler
      return NextResponse.next();
    } catch (error) {
      console.error('Webhook verification error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Rate limit webhook requests by IP
 * @param maxRequests - Maximum requests per time window
 * @param windowMs - Time window in milliseconds
 */
export function withWebhookRateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  // Simple in-memory store for rate limiting
  // In production, you should use Redis or another distributed store
  const requestCounts = new Map<string, { count: number; resetTime: number }>();
  
  return async function middleware(request: NextRequest) {
    try {
      // Get IP address from headers (Next.js way)
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                 request.headers.get('x-real-ip') ||
                 'unknown';
      
      const now = Date.now();
      const key = `${ip}:${Math.floor(now / windowMs)}`;
      
      const record = requestCounts.get(key);
      
      if (record) {
        if (record.resetTime <= now) {
          // Reset the count
          record.count = 1;
          record.resetTime = now + windowMs;
        } else {
          // Increment the count
          record.count++;
          
          if (record.count > maxRequests) {
            return NextResponse.json(
              { error: 'Too many requests' },
              { status: 429 }
            );
          }
        }
      } else {
        // Create a new record
        requestCounts.set(key, {
          count: 1,
          resetTime: now + windowMs
        });
      }
      
      // Clean up old records periodically
      if (Math.random() < 0.1) { // 10% chance to clean up
        const cutoff = now - windowMs;
        for (const [key, record] of requestCounts.entries()) {
          if (record.resetTime <= cutoff) {
            requestCounts.delete(key);
          }
        }
      }
      
      // Continue to the next middleware or route handler
      return NextResponse.next();
    } catch (error) {
      console.error('Webhook rate limit error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

export default {
  verifyWebhookSignature,
  verifyRazorpayWebhook,
  verifyStripeWebhook,
  withWebhookVerification,
  withWebhookRateLimit
};