"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface BookingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const BookingPanel: React.FC<BookingPanelProps> = ({ isOpen, onClose, userId }) => {
  const [selectedBunk, setSelectedBunk] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [duration, setDuration] = useState(1); // Duration in hours
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const createPaymentOrder = async (amount: number) => {
    try {
      const response = await fetch('/api/payment/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stationId: selectedBunk,
          slotId: selectedSlot,
          duration: duration,
          amount: amount,
          userId: userId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error creating payment order:', err);
      throw err;
    }
  };

  const handleBooking = async () => {
    if (paymentMethod === 'razorpay') {
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await loadRazorpay();
        
        if (!res) {
          throw new Error('Failed to load Razorpay');
        }
        
        // Calculate amount based on duration (₹50 per hour for example)
        const amount = duration * 50;
        
        // Create payment order
        const orderData = await createPaymentOrder(amount);
        
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_example',
          amount: orderData.amount, // Amount in paise
          currency: orderData.currency,
          name: 'EV Bunker',
          description: `Charging Slot Booking for ${duration} hour(s)`,
          image: '/logo.png',
          order_id: orderData.orderId,
          handler: function (response: any) {
            console.log('Payment successful:', response);
            alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
            // Close the panel after successful payment
            onClose();
          },
          prefill: {
            name: 'John Doe',
            email: 'john@example.com',
            contact: '9876543210',
          },
          notes: {
            address: 'EV Bunker Corporate Office',
            bookingId: orderData.bookingId
          },
          theme: {
            color: '#8B5CF6',
          },
          modal: {
            ondismiss: function() {
              console.log('Payment cancelled');
              setIsLoading(false);
            }
          }
        };
        
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err: any) {
        console.error('Booking error:', err);
        setError(err.message || 'Failed to process booking. Please try again.');
        alert('Failed to process booking. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Handle other payment methods
      alert('Booking confirmed with saved payment method!');
      onClose();
    }
  };

  // Calculate total amount based on duration
  const totalAmount = duration * 50;

  return (
    <>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div 
                className="absolute inset-0 bg-[#0F172A]/80"
                onClick={onClose}
              ></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <motion.div
              className="inline-block align-bottom bg-[#1E293B] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-[#334155] w-full max-w-md mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-3 sm:px-6 sm:py-5 border-b border-[#334155] flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-white">Book & Pay</h3>
                <button 
                  onClick={onClose}
                  className="text-[#94A3B8] hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-4 py-3 sm:px-6 sm:py-5">
                {error && (
                  <div className="mb-4 p-3 bg-red-900/50 border border-red-800/50 text-red-400 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Select Bunk</label>
                  <select 
                    className="w-full bg-[#334155] border border-[#475569] rounded-lg px-3 py-2 sm:px-4 sm:py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                    value={selectedBunk}
                    onChange={(e) => setSelectedBunk(e.target.value)}
                  >
                    <option value="">Select a charging bunk</option>
                    <option value="delhi">Delhi Metro Station</option>
                    <option value="mumbai">Mumbai Central</option>
                    <option value="bangalore">Bangalore IT Park</option>
                    <option value="chennai">Chennai Airport</option>
                  </select>
                </div>
                
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Select Slot</label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {['A-01', 'A-02', 'A-03', 'B-01', 'B-02', 'B-03', 'C-01', 'C-02', 'C-03'].map((slot) => (
                      <button
                        key={slot}
                        className={`bg-[#334155] border rounded-lg py-2 text-white transition-colors text-sm sm:text-base ${
                          selectedSlot === slot 
                            ? 'border-[#10B981] bg-[#10B981]/20' 
                            : 'border-[#475569] hover:bg-[#475569]'
                        }`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                    Duration: {duration} hour{duration !== 1 ? 's' : ''}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-[#94A3B8] mt-1">
                    <span>1h</span>
                    <span>8h</span>
                  </div>
                </div>
                
                <div className="mb-4 sm:mb-6 p-3 bg-[#334155]/50 rounded-lg border border-[#475569]/50">
                  <div className="flex justify-between items-center">
                    <span className="text-[#94A3B8]">Total Amount:</span>
                    <span className="text-xl font-bold text-[#10B981]">₹{totalAmount}</span>
                  </div>
                </div>
                
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Payment Method</label>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="razorpay" 
                        name="payment" 
                        className="mr-2" 
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                      />
                      <label htmlFor="razorpay" className="text-white text-sm sm:text-base">Razorpay</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="saved" 
                        name="payment" 
                        className="mr-2" 
                        checked={paymentMethod === 'saved'}
                        onChange={() => setPaymentMethod('saved')}
                      />
                      <label htmlFor="saved" className="text-white text-sm sm:text-base">Saved Card (**** 1234)</label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 sm:space-x-3">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="border-[#475569] text-[#CBD5E1] hover:bg-[#334155] px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white hover:from-[#7C3AED] hover:to-[#059669] px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base"
                    onClick={handleBooking}
                    disabled={!selectedBunk || !selectedSlot || isLoading}
                  >
                    {isLoading ? 'Processing...' : `Pay ₹${totalAmount}`}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </>
  );
};