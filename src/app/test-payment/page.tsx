"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function TestPaymentPage() {
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleTestPayment = async () => {
    setIsLoading(true);
    setPaymentStatus('Creating payment order...');
    
    try {
      // Create a test payment order
      const response = await fetch('/api/payment/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stationId: 'test-station-1',
          slotId: 'test-slot-1',
          duration: 1,
          amount: 100, // ₹100
          userId: 'test-user-1'
        }),
      });

      const orderData = await response.json();
      
      if (!response.ok || orderData.error) {
        setPaymentStatus(`Error creating order: ${orderData.error}`);
        setIsLoading(false);
        return;
      }

      setOrderId(orderData.orderId);
      setPaymentStatus(`Order created: ${orderData.orderId}`);

      // Check if we're using test credentials
      const razorpayKey = process.env["NEXT_PUBLIC_RZP_KEY_ID"] || 'rzp_test_example';
      const isTestMode = razorpayKey.includes('rzp_test_') || razorpayKey.includes('XXXXXXXX');
      
      if (isTestMode) {
        // Mock payment flow for testing
        setPaymentStatus('Processing mock payment...');
        
        // Simulate successful payment
        setTimeout(async () => {
          try {
            // Verify payment with mock data
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: orderData.orderId,
                razorpay_payment_id: `pay_${Date.now()}`,
                razorpay_signature: "test_signature",
              }),
            });
            
            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
              setPaymentStatus(`Payment verified successfully! Booking ID: ${verifyData.bookingId}`);
            } else {
              setPaymentStatus(`Payment verification failed: ${verifyData.error}`);
            }
          } catch (verifyError) {
            setPaymentStatus(`Error verifying payment: ${verifyError}`);
          } finally {
            setIsLoading(false);
          }
        }, 1500); // Simulate 1.5 second payment processing
      } else {
        // Load Razorpay script for real payments
        const res = await loadRazorpay();
        if (!res) {
          setPaymentStatus('Failed to load Razorpay');
          setIsLoading(false);
          return;
        }

        // Initialize Razorpay
        const options = {
          key: razorpayKey,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'EV Bunker Test',
          description: 'Test Payment',
          order_id: orderData.orderId,
          handler: async function (response: any) {
            setPaymentStatus('Payment successful, verifying...');
            
            try {
              // Verify payment
              const verifyResponse = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
              
              const verifyData = await verifyResponse.json();
              
              if (verifyData.success) {
                setPaymentStatus(`Payment verified successfully! Booking ID: ${verifyData.bookingId}`);
              } else {
                setPaymentStatus(`Payment verification failed: ${verifyData.error}`);
              }
            } catch (verifyError) {
              setPaymentStatus(`Error verifying payment: ${verifyError}`);
            } finally {
              setIsLoading(false);
            }
          },
          prefill: {
            name: 'Test User',
            email: 'test@example.com',
          },
          theme: {
            color: '#10B981',
          },
        };
        
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      setPaymentStatus(`Error: ${error}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex flex-col items-center justify-center p-4">
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Payment Flow Test</h1>
        
        <div className="mb-6">
          <p className="text-[#94A3B8] mb-2">Status:</p>
          <div className="bg-[#334155]/30 rounded-lg p-4 border border-[#475569]/50 min-h-[60px]">
            <p className="text-[#F1F5F9]">{paymentStatus}</p>
          </div>
        </div>
        
        {orderId && (
          <div className="mb-6">
            <p className="text-[#94A3B8] mb-2">Order ID:</p>
            <div className="bg-[#334155]/30 rounded-lg p-4 border border-[#475569]/50">
              <p className="text-[#F1F5F9] font-mono text-sm">{orderId}</p>
            </div>
          </div>
        )}
        
        <Button
          onClick={handleTestPayment}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:from-[#7C3AED] hover:to-[#059669] text-white py-3"
        >
          {isLoading ? 'Processing...' : 'Test Payment Flow'}
        </Button>
        
        <div className="mt-6 text-center">
          <a 
            href="/dashboard" 
            className="text-[#8B5CF6] hover:text-[#7C3AED] text-sm"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}