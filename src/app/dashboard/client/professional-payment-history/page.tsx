"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/landing/Navbar';
import { Button } from '@/components/common/Button';
import { Footer } from '@/components/landing/Footer';
import { useLoader } from '@/context/LoaderContext';
import { ProfessionalPaymentHistoryCard } from '@/components/dashboard/ProfessionalPaymentHistoryCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { Payment } from '@/types/payment';

// Loading component for Suspense
function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155]">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="glass rounded-2xl p-6 shadow-lg border border-[#475569]/50 relative overflow-hidden">
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mb-4" />
                <p className="text-[#CBD5E1]">Loading payment history...</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ProfessionalPaymentHistoryContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching payment data
    const fetchPayments = async () => {
      showLoader("Loading payment history...");
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock payment data
      const mockPayments: Payment[] = [
        {
          id: "1",
          _id: "1",
          userId: "user1",
          paymentId: "pay1",
          orderId: "order1",
          amount: 150,
          status: "completed",
          currency: "INR",
          method: "card",
          createdAt: "2023-06-15T14:30:00Z",
          updatedAt: "2023-06-15T14:35:00Z"
        },
        {
          id: "2",
          _id: "2",
          userId: "user1",
          paymentId: "pay2",
          orderId: "order2",
          amount: 80,
          status: "completed",
          currency: "INR",
          method: "upi",
          createdAt: "2023-06-10T10:15:00Z",
          updatedAt: "2023-06-10T10:20:00Z"
        },
        {
          id: "3",
          _id: "3",
          userId: "user1",
          paymentId: "pay3",
          orderId: "order3",
          amount: 120,
          status: "pending",
          currency: "INR",
          method: "card",
          createdAt: "2023-06-05T16:45:00Z",
          updatedAt: "2023-06-05T16:45:00Z"
        }
      ];
      
      setPayments(mockPayments);
      setLoading(false);
      hideLoader();
    };

    if (status === "authenticated") {
      fetchPayments();
    }
  }, [status, showLoader, hideLoader]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155]">
        <Navbar />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4">
            <div className="glass rounded-2xl p-6 shadow-lg border border-[#475569]/50 relative overflow-hidden">
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <LoadingSpinner size="lg" className="mb-4" />
                  <p className="text-[#CBD5E1]">Authenticating...</p>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155]">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#F1F5F9]">Payment History</h1>
              <p className="text-[#94A3B8]">View and manage your payment transactions</p>
            </div>
            <Button 
              onClick={() => router.push('/dashboard/client')}
              variant="outline"
              className="hidden md:inline-flex"
            >
              Back to Dashboard
            </Button>
          </div>
          
          <ProfessionalPaymentHistoryCard 
            payments={payments}
            loading={loading}
          />
          
          <div className="mt-6">
            <Button 
              onClick={() => router.push('/dashboard/client')}
              variant="outline"
              className="md:hidden w-full"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ProfessionalPaymentHistory() {
  return (
    <Suspense fallback={<Loading />}>
      <ProfessionalPaymentHistoryContent />
    </Suspense>
  );
}