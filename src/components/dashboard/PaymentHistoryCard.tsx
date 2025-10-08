"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { Payment } from '@/types/payment';

interface PaymentHistoryCardProps {
  payments: Payment[];
  loading: boolean;
  onViewAll: () => void;
}

export const PaymentHistoryCard: React.FC<PaymentHistoryCardProps> = ({ 
  payments = [], 
  loading,
  onViewAll
}) => {
  const [displayPayments, setDisplayPayments] = useState<Payment[]>([]);
  
  useEffect(() => {
    // Show only the first 3 payments in the card
    setDisplayPayments(payments.slice(0, 3));
  }, [payments]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-[#1E293B]/80 border border-[#334155] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#F1F5F9]">Payment History</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8">
          <LoadingSpinner size="md" className="mb-4" />
          <p className="text-[#94A3B8]">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#1E293B]/80 border border-[#334155] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#F1F5F9]">Payment History</h2>
        {payments.length > 3 && (
          <button 
            onClick={onViewAll}
            className="text-sm text-[#8B5CF6] hover:text-[#7C3AED] transition-colors"
          >
            View All
          </button>
        )}
      </div>
      
      {displayPayments.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-block p-3 rounded-full bg-[#334155]/50 mb-3">
            <svg className="w-8 h-8 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p className="text-[#94A3B8]">No payment history yet</p>
          <p className="text-[#64748B] text-sm mt-1">Your transactions will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayPayments.map((payment) => (
            <motion.div
              key={payment._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-3 rounded-xl bg-[#334155]/30 border border-[#475569]/50"
            >
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-[#8B5CF6]/20 mr-3">
                  <svg className="w-5 h-5 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-[#F1F5F9]">₹{payment.amount}</h3>
                  <p className="text-xs text-[#94A3B8]">
                    {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="px-2 py-1 rounded-full text-xs font-medium bg-[#10B981]/20 text-[#10B981]">
                {payment.status}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};