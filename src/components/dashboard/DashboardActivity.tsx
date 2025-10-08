"use client";

import React from 'react';
import { Card } from '@/components/common/Card';

interface Client {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdAt: string;
  totalChargingSessions?: number;
  totalAmountSpent?: number;
  co2Saved?: number;
}

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

interface DashboardActivityProps {
  clients: Client[];
  payments: Payment[];
}

export function DashboardActivity({ clients, payments }: DashboardActivityProps) {
  return (
    <div className="w-full">
      {/* Recent activity - Mobile-first responsive design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-4 md:p-6">
          <h3 className="text-lg font-bold text-[#F1F5F9] mb-4 md:mb-6">Recent Clients</h3>
          <div className="space-y-3 md:space-y-4">
            {clients.slice(0, 5).map((client) => (
              <div key={client._id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] flex items-center justify-center text-white text-xs md:text-sm font-medium mr-2 md:mr-3">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[#F1F5F9] font-medium text-sm md:text-base">{client.name}</p>
                    <p className="text-[#CBD5E1] text-xs md:text-sm">{client.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  client.status === 'active' 
                    ? 'bg-green-900/30 text-green-400' 
                    : client.status === 'suspended'
                      ? 'bg-red-900/30 text-red-400'
                      : 'bg-yellow-900/30 text-yellow-400'
                }`}>
                  {client.status}
                </span>
              </div>
            ))}
            {clients.length === 0 && (
              <div className="text-center py-4 text-[#CBD5E1]">
                No clients found
              </div>
            )}
          </div>
        </Card>
        
        <Card className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-4 md:p-6">
          <h3 className="text-lg font-bold text-[#F1F5F9] mb-4 md:mb-6">Recent Payments</h3>
          <div className="space-y-3 md:space-y-4">
            {payments.slice(0, 5).map((payment) => (
              <div key={payment._id} className="flex items-center justify-between">
                <div>
                  <p className="text-[#F1F5F9] font-medium text-sm md:text-base">₹{payment.amount}</p>
                  <p className="text-[#CBD5E1] text-xs md:text-sm">
                    {new Date(payment.createdAt).toLocaleDateString()} at {new Date(payment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                  <p className="text-[#94A3B8] text-xs mt-1">
                    Order ID: {payment.orderId.substring(0, 8)}...
                  </p>
                </div>
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
              </div>
            ))}
            {payments.length === 0 && (
              <div className="text-center py-4 text-[#CBD5E1]">
                No payments found
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}