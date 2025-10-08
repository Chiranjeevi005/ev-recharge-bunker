"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { Payment } from '@/types/payment';

interface ProfessionalPaymentHistoryCardProps {
  payments: Payment[];
  loading: boolean;
}

export const ProfessionalPaymentHistoryCard: React.FC<ProfessionalPaymentHistoryCardProps> = ({ 
  payments = [], 
  loading
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = payments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(payments.length / itemsPerPage);

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 shadow-lg border border-[#475569]/50 relative overflow-hidden">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <LoadingSpinner size="md" className="mb-4" />
            <p className="text-[#CBD5E1]">Loading payment history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 shadow-lg border border-[#475569]/50 relative overflow-hidden">
      <h2 className="text-2xl font-bold text-[#F1F5F9] mb-6">Payment History</h2>
      
      {payments.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block p-4 rounded-full bg-[#334155]/50 mb-4">
            <svg className="w-12 h-12 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[#F1F5F9] mb-2">No Payments Yet</h3>
          <p className="text-[#94A3B8] max-w-md mx-auto">
            Your payment history will appear here once you complete transactions.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#475569]/50">
                  <th className="pb-3 text-left text-[#94A3B8] font-medium">Date</th>
                  <th className="pb-3 text-left text-[#94A3B8] font-medium">Station</th>
                  <th className="pb-3 text-left text-[#94A3B8] font-medium">Amount</th>
                  <th className="pb-3 text-left text-[#94A3B8] font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentPayments.map((payment) => (
                  <motion.tr 
                    key={payment._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-b border-[#475569]/30 last:border-0"
                  >
                    <td className="py-4 text-[#F1F5F9]">
                      {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 text-[#F1F5F9]">
                      {payment.stationId ? `Station #${payment.stationId.slice(-4)}` : 'Unknown Station'}
                    </td>
                    <td className="py-4 text-[#F1F5F9]">₹{payment.amount}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'completed' 
                          ? 'bg-[#10B981]/20 text-[#10B981]' 
                          : payment.status === 'pending'
                          ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                          : 'bg-[#EF4444]/20 text-[#EF4444]'
                      }`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg ${
                  currentPage === 1 
                    ? 'text-[#64748B] cursor-not-allowed' 
                    : 'text-[#8B5CF6] hover:bg-[#334155]/50'
                }`}
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg ${
                    currentPage === page
                      ? 'bg-[#8B5CF6] text-white'
                      : 'text-[#94A3B8] hover:bg-[#334155]/50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-lg ${
                  currentPage === totalPages 
                    ? 'text-[#64748B] cursor-not-allowed' 
                    : 'text-[#8B5CF6] hover:bg-[#334155]/50'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};