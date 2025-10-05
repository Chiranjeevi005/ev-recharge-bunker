"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/landing/Navbar';
import { Button } from '@/components/common/Button';
import { Footer } from '@/components/landing/Footer';
import { useLoader } from '@/context/LoaderContext';

interface Payment {
  _id: string;
  userId: string;
  paymentId: string;
  orderId: string;
  amount: number;
  status: string;
  method: string;
  stationId: string;
  stationName?: string;
  slotId: string;
  duration: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export default function PaymentHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showLoader, hideLoader } = useLoader();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch payment history
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const fetchPaymentHistory = async () => {
        try {
          setLoading(true);
          setError(null);
          showLoader("Loading payment history...");
          
          const response = await fetch(`/api/payments?userId=${session.user.id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch payment history');
          }
          
          const data = await response.json();
          setPayments(data);
          hideLoader();
        } catch (err) {
          console.error("Error fetching payment history:", err);
          setError("Failed to load payment history. Please try again later.");
          hideLoader();
        } finally {
          setLoading(false);
        }
      };

      fetchPaymentHistory();
    }
  }, [status, session, showLoader, hideLoader]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'bg-green-900/50 border-green-800/50 text-green-400';
      case 'processing':
        return 'bg-yellow-900/50 border-yellow-800/50 text-yellow-400';
      case 'pending':
        return 'bg-blue-900/50 border-blue-800/50 text-blue-400';
      case 'failed':
        return 'bg-red-900/50 border-red-800/50 text-red-400';
      default:
        return 'bg-gray-900/50 border-gray-800/50 text-gray-400';
    }
  };

  const formatPaymentId = (id: string) => {
    if (!id) return 'N/A';
    return id.length > 20 ? `${id.substring(0, 10)}...${id.substring(id.length - 10)}` : id;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const getStationName = (payment: Payment) => {
    if (payment.stationName) return payment.stationName;
    if (payment.stationId) return `Station ${payment.stationId.substring(0, 8)}`;
    return 'Unknown Station';
  };

  if (status === "loading") {
    return null;
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155]">
      <Navbar />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-[#F1F5F9] mb-2">
                  Payment History
                </h1>
                <p className="text-[#CBD5E1]">
                  View all your payment transactions
                </p>
              </div>
              <Button 
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="border-[#94A3B8] text-[#F1F5F9] hover:bg-[#475569]/50"
              >
                Back to Dashboard
              </Button>
            </div>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-900/50 border border-red-800/50 text-red-400 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          <motion.div
            className="glass rounded-2xl p-6 shadow-lg border border-[#475569]/50 relative overflow-hidden bg-[#1E293B]/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B5CF6] mb-4"></div>
                  <p className="text-[#CBD5E1]">Loading payment history...</p>
                </div>
              </div>
            ) : payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#64748B]/50">
                      <th className="text-left py-3 text-[#CBD5E1] font-medium">Station</th>
                      <th className="text-left py-3 text-[#CBD5E1] font-medium">Amount</th>
                      <th className="text-left py-3 text-[#CBD5E1] font-medium">Duration</th>
                      <th className="text-left py-3 text-[#CBD5E1] font-medium">Payment ID</th>
                      <th className="text-left py-3 text-[#CBD5E1] font-medium">Order ID</th>
                      <th className="text-left py-3 text-[#CBD5E1] font-medium">Date</th>
                      <th className="text-left py-3 text-[#CBD5E1] font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, index) => (
                      <motion.tr
                        key={payment._id || index}
                        className="border-b border-[#64748B]/50 hover:bg-[#475569]/30 backdrop-blur-sm"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                      >
                        <td className="py-4 text-[#F1F5F9] max-w-[150px] truncate" title={getStationName(payment)}>
                          {getStationName(payment)}
                        </td>
                        <td className="py-4 text-[#F1F5F9]">₹{payment.amount}</td>
                        <td className="py-4 text-[#F1F5F9]">{payment.duration} hour{payment.duration !== 1 ? 's' : ''}</td>
                        <td className="py-4 text-[#CBD5E1] font-mono text-sm max-w-[120px] truncate" title={payment.paymentId}>
                          {formatPaymentId(payment.paymentId)}
                        </td>
                        <td className="py-4 text-[#CBD5E1] font-mono text-sm max-w-[120px] truncate" title={payment.orderId}>
                          {formatPaymentId(payment.orderId)}
                        </td>
                        <td className="py-4 text-[#CBD5E1] text-sm max-w-[150px] truncate">
                          {formatDate(payment.createdAt)}
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-16 h-16 text-[#475569] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <h3 className="text-xl font-medium text-[#F1F5F9] mb-2">No payment history</h3>
                  <p className="text-[#CBD5E1] mb-4">You haven't made any payments yet</p>
                  <Button 
                    onClick={() => router.push('/find-bunks')}
                    className="bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:from-[#7C3AED] hover:to-[#059669] text-white"
                  >
                    Book a Slot
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}