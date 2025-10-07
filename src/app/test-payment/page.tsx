"use client";

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import Toast from '@/components/common/Toast';

export default function TestPaymentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [testResults, setTestResults] = useState<any>(null);

  const runEndToEndTest = async () => {
    setIsLoading(true);
    setToast(null);
    setTestResults(null);
    
    try {
      const response = await fetch('/api/payment/test-end-to-end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setToast({
          message: 'Payment flow test completed successfully!',
          type: 'success'
        });
        setTestResults(data);
      } else {
        setToast({
          message: `Test failed: ${data.error}`,
          type: 'error'
        });
      }
    } catch (error: any) {
      setToast({
        message: `Test failed: ${error.message || 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#F1F5F9] mb-4">
            Payment Flow Test
          </h1>
          <p className="text-lg text-[#94A3B8] max-w-2xl mx-auto">
            Test the end-to-end payment flow to ensure all components are working correctly
          </p>
        </div>

        <Card className="bg-[#1E293B]/50 border border-[#334155] backdrop-blur-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-[#F1F5F9] mb-4">Run Payment Flow Test</h2>
          <p className="text-[#94A3B8] mb-6">
            This test will verify the complete payment flow including:
          </p>
          <ul className="text-[#94A3B8] mb-6 space-y-2">
            <li className="flex items-center">
              <span className="text-[#10B981] mr-2">✓</span>
              Razorpay order creation
            </li>
            <li className="flex items-center">
              <span className="text-[#10B981] mr-2">✓</span>
              Database storage
            </li>
            <li className="flex items-center">
              <span className="text-[#10B981] mr-2">✓</span>
              Signature verification
            </li>
            <li className="flex items-center">
              <span className="text-[#10B981] mr-2">✓</span>
              Payment status update
            </li>
            <li className="flex items-center">
              <span className="text-[#10B981] mr-2">✓</span>
              Booking creation
            </li>
          </ul>
          
          <Button
            onClick={runEndToEndTest}
            disabled={isLoading}
            className="w-full py-3"
            size="lg"
          >
            {isLoading ? 'Running Test...' : 'Run End-to-End Test'}
          </Button>
        </Card>

        {testResults && (
          <Card className="bg-[#1E293B]/50 border border-[#334155] backdrop-blur-xl p-6">
            <h2 className="text-xl font-bold text-[#F1F5F9] mb-4">Test Results</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="text-[#10B981] mr-2">✓</span>
                <span className="text-[#F1F5F9]">Order ID: {testResults.orderId}</span>
              </div>
              <div className="flex items-center">
                <span className="text-[#10B981] mr-2">✓</span>
                <span className="text-[#F1F5F9]">Payment ID: {testResults.paymentId}</span>
              </div>
              <div className="flex items-center">
                <span className="text-[#10B981] mr-2">✓</span>
                <span className="text-[#F1F5F9]">Booking ID: {testResults.bookingId}</span>
              </div>
              <div className="mt-4 p-4 bg-[#10B981]/10 rounded-lg">
                <p className="text-[#10B981] font-medium">{testResults.message}</p>
              </div>
            </div>
          </Card>
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}