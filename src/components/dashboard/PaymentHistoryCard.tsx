import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface Payment {
  userId: string;
  paymentId: string;
  amount: number;
  status: string;
  method: string;
  // Updated to match the actual data structure from the API
  createdAt: string;
  updatedAt: string;
  date?: string; // Optional field for backward compatibility
}

interface PaymentHistoryCardProps {
  payments: Payment[];
  onViewAll: () => void;
}

const PaymentHistoryCard: React.FC<PaymentHistoryCardProps> = ({ payments, onViewAll }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'bg-green-900/50 border-green-800/50 text-green-400 backdrop-blur-sm';
      case 'processing':
        return 'bg-yellow-900/50 border-yellow-800/50 text-yellow-400 backdrop-blur-sm';
      case 'pending':
        return 'bg-blue-900/50 border-blue-800/50 text-blue-400 backdrop-blur-sm';
      case 'failed':
        return 'bg-red-900/50 border-red-800/50 text-red-400 backdrop-blur-sm';
      default:
        return 'bg-gray-900/50 border-gray-800/50 text-gray-400 backdrop-blur-sm';
    }
  };

  const formatPaymentId = (id: string) => {
    if (!id) return 'N/A';
    return id.length > 20 ? `${id.substring(0, 10)}...${id.substring(id.length - 10)}` : id;
  };

  const formatDate = (payment: Payment) => {
    // Use the date field if available (from socket updates), otherwise use createdAt
    const dateString = payment.date || payment.createdAt;
    
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

  return (
    <motion.div
      className="glass rounded-2xl p-6 shadow-lg border border-[#475569]/50 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.15)] pointer-events-none"></div>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#F1F5F9]">Payment History</h2>
        <Button 
          onClick={onViewAll}
          variant="outline"
          className="border-[#94A3B8] text-[#F1F5F9] hover:bg-[#475569]/50"
        >
          View All
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#64748B]/50">
              <th className="text-left py-3 text-[#CBD5E1] font-medium">Station</th>
              <th className="text-left py-3 text-[#CBD5E1] font-medium">Amount</th>
              <th className="text-left py-3 text-[#CBD5E1] font-medium">Payment ID</th>
              <th className="text-left py-3 text-[#CBD5E1] font-medium">Date</th>
              <th className="text-left py-3 text-[#CBD5E1] font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.slice(0, 5).map((payment, index) => (
                <motion.tr
                  key={payment.paymentId || index}
                  className="border-b border-[#64748B]/50 hover:bg-[#475569]/30 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <td className="py-4 text-[#F1F5F9]">Delhi Metro Station</td>
                  <td className="py-4 text-[#F1F5F9]">₹{payment.amount}</td>
                  <td className="py-4 text-[#CBD5E1] font-mono text-sm">
                    {formatPaymentId(payment.paymentId)}
                  </td>
                  <td className="py-4 text-[#CBD5E1] text-sm">
                    {formatDate(payment)}
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#CBD5E1]">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-12 h-12 text-[#475569] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p>No payment history available</p>
                    <p className="text-sm mt-1">Your payment transactions will appear here</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default PaymentHistoryCard;