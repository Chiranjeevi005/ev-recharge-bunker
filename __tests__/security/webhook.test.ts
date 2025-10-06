import { verifyWebhookSignature, verifyRazorpayWebhook, verifyStripeWebhook } from '@/lib/security/webhook';
import crypto from 'crypto';

describe('Webhook Security', () => {
  describe('verifyWebhookSignature', () => {
    const secret = 'test-secret-key';
    const payload = JSON.stringify({ test: 'data' });
    
    it('should verify a valid signature', () => {
      const signature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      
      expect(verifyWebhookSignature(payload, signature, secret)).toBe(true);
    });
    
    it('should reject an invalid signature', () => {
      const signature = 'invalid-signature';
      expect(verifyWebhookSignature(payload, signature, secret)).toBe(false);
    });
    
    it('should handle buffer payloads', () => {
      const bufferPayload = Buffer.from(payload);
      const signature = crypto
        .createHmac('sha256', secret)
        .update(bufferPayload)
        .digest('hex');
      
      expect(verifyWebhookSignature(bufferPayload, signature, secret)).toBe(true);
    });
  });
  
  describe('verifyRazorpayWebhook', () => {
    const secret = 'razorpay-webhook-secret';
    const payload = JSON.stringify({ event: 'payment.captured', payload: {} });
    
    it('should verify a valid Razorpay webhook signature', () => {
      const signature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      
      expect(verifyRazorpayWebhook(payload, signature, secret)).toBe(true);
    });
    
    it('should reject an invalid Razorpay webhook signature', () => {
      const signature = 'invalid-signature';
      expect(verifyRazorpayWebhook(payload, signature, secret)).toBe(false);
    });
  });
  
  describe('verifyStripeWebhook', () => {
    const secret = 'stripe-webhook-secret';
    const payload = JSON.stringify({ event: 'payment_intent.succeeded', data: {} });
    
    it('should verify a valid Stripe webhook signature', () => {
      const signature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      
      const stripeSignature = `v1=${signature}`;
      expect(verifyStripeWebhook(payload, stripeSignature, secret)).toBe(true);
    });
    
    it('should reject an invalid Stripe webhook signature', () => {
      const signature = 'invalid-signature';
      expect(verifyStripeWebhook(payload, signature, secret)).toBe(false);
    });
  });
});