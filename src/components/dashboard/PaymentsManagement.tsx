"use client";

import React, { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

interface Payment {
  _id: string;
  userId: string;
  stationId: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  currency: string;
  method?: string;
  createdAt: string;
}

interface PaymentsManagementProps {
  payments: Payment[];
  paymentsSubTab: string;
  setPaymentsSubTab: (subTab: string) => void;
  updateUrl: (tab: string, subTab: string) => void;
}

export function PaymentsManagement({ payments, paymentsSubTab, setPaymentsSubTab, updateUrl }: PaymentsManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter payments based on the active sub-tab and search term
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          payment.userId.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (paymentsSubTab === 'all') return matchesSearch;
    return payment.status === paymentsSubTab && matchesSearch;
  });

  return (
    <div className="w-full">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#F1F5F9] mb-1">Payment Management</h2>
        <p className="text-[#CBD5E1] text-xs sm:text-sm">Monitor all payment transactions in the system</p>
      </div>
      
      {/* Sub-tabs for Payments - Mobile-first responsive design */}
      <div className="mb-4 sm:mb-6 border-b border-[#334155] overflow-x-auto">
        <nav className="flex space-x-3 sm:space-x-4 md:space-x-6 min-w-max">
          <button
            onClick={() => {
              setPaymentsSubTab('all');
              updateUrl('payments', 'all');
            }}
            className={`py-2 px-1 text-xs sm:text-sm font-medium whitespace-nowrap ${
              paymentsSubTab === 'all'
                ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
            }`}
          >
            All Payments
          </button>
          <button
            onClick={() => {
              setPaymentsSubTab('completed');
              updateUrl('payments', 'completed');
            }}
            className={`py-2 px-1 text-xs sm:text-sm font-medium whitespace-nowrap ${
              paymentsSubTab === 'completed'
                ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => {
              setPaymentsSubTab('pending');
              updateUrl('payments', 'pending');
            }}
            className={`py-2 px-1 text-xs sm:text-sm font-medium whitespace-nowrap ${
              paymentsSubTab === 'pending'
                ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => {
              setPaymentsSubTab('failed');
              updateUrl('payments', 'failed');
            }}
            className={`py-2 px-1 text-xs sm:text-sm font-medium whitespace-nowrap ${
              paymentsSubTab === 'failed'
                ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
            }`}
          >
            Failed
          </button>
          <button
            onClick={() => {
              setPaymentsSubTab('refunded');
              updateUrl('payments', 'refunded');
            }}
            className={`py-2 px-1 text-xs sm:text-sm font-medium whitespace-nowrap ${
              paymentsSubTab === 'refunded'
                ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
            }`}
          >
            Refunded
          </button>
        </nav>
      </div>

      <Card className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-[#CBD5E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-[#334155] text-[#1E293B] placeholder-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent text-xs sm:text-sm"
            />
          </div>
          <div className="flex space-x-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
              </svg>
              <span className="hidden sm:inline ml-1">Filter</span>
            </Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              <span className="hidden sm:inline ml-1">Export</span>
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="py-2 text-left text-[#CBD5E1] font-medium text-xs">Payment ID</th>
                <th className="py-2 text-left text-[#CBD5E1] font-medium text-xs hidden sm:table-cell">Client</th>
                <th className="py-2 text-left text-[#CBD5E1] font-medium text-xs">Amount</th>
                <th className="py-2 text-left text-[#CBD5E1] font-medium text-xs">Status</th>
                <th className="py-2 text-left text-[#CBD5E1] font-medium text-xs">Date</th>
                <th className="py-2 text-left text-[#CBD5E1] font-medium text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment._id} className="border-b border-[#334155] hover:bg-[#F1F5F9]/30">
                  <td className="py-3 text-[#F1F5F9] text-xs">#{payment.orderId.substring(0, 8)}</td>
                  <td className="py-3 text-[#CBD5E1] text-xs hidden sm:table-cell">Client {payment.userId.substring(0, 8)}</td>
                  <td className="py-3 text-[#F1F5F9] text-xs">₹{payment.amount}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      payment.status === 'completed' 
                        ? 'bg-green-900/30 text-green-400' 
                        : payment.status === 'failed'
                          ? 'bg-red-900/30 text-red-400'
                          : payment.status === 'refunded'
                            ? 'bg-blue-900/30 text-blue-400'
                            : 'bg-yellow-900/30 text-yellow-400'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-3 text-[#CBD5E1] text-xs">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" className="p-1">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      </Button>
                      {payment.status === 'completed' && (
                        <Button variant="outline" size="sm" className="p-1 text-blue-400 hover:text-blue-300">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                          </svg>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPayments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[#CBD5E1]">No payments found matching your criteria.</p>
          </div>
        )}
      </Card>
    </div>
  );
}