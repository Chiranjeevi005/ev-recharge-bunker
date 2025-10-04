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
      console.log('Creating payment order');
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

      console.log('Order creation response status:', response.status);
      const orderData = await response.json();
      console.log('Order creation response data:', orderData);
      
      if (!response.ok || orderData.error) {
        setPaymentStatus(`Error creating order: ${orderData.error}`);
        setIsLoading(false);
        return;
      }

      setOrderId(orderData.orderId);
      setPaymentStatus(`Order created: ${orderData.orderId}`);
      console.log('Order created successfully:', orderData.orderId);

      // Check if we're using test credentials
      // In a real application, you would check the actual environment
      // For this test, we'll assume we're in test mode
      const isTestMode = true;
      const razorpayKey = 'rzp_test_example'; // Not used in test mode
      console.log('Is test mode:', isTestMode);
      
      if (isTestMode) {
        // Mock payment flow for testing
        setPaymentStatus('Processing mock payment...');
        
        // Simulate successful payment
        console.log('Starting mock payment simulation');
        setTimeout(async () => {
          try {
            console.log('Mock payment simulation completed');
            // In a real browser environment, we can't generate the proper signature
            // For testing purposes, we'll skip signature verification in the API
            // or use a special test endpoint that bypasses signature verification
            
            // Verify payment with mock data
            console.log('Sending verification request');
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: orderData.orderId,
                razorpay_payment_id: `pay_${Date.now()}`,
                razorpay_signature: "test_signature",
                is_test: true, // Flag to indicate this is a test
              }),
            });
            
            console.log('Verification response status:', verifyResponse.status);
            const verifyData = await verifyResponse.json();
            console.log('Verification response data:', verifyData);
            
            if (verifyData.success) {
              setPaymentStatus(`Payment verified successfully! Booking ID: ${verifyData.bookingId}`);
            } else {
              setPaymentStatus(`Payment verification failed: ${verifyData.error}`);
            }
          } catch (verifyError) {
            console.error('Error in verification:', verifyError);
            setPaymentStatus(`Error verifying payment: ${verifyError}`);
          } finally {
            console.log('Finished mock payment simulation');
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
      console.error('Error in handleTestPayment:', error);
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