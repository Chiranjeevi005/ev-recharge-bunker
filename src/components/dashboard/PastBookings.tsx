"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { EnergyAnimation } from '@/components/ui/EnergyAnimation';

interface Booking {
  id: number;
  bunkName: string;
  slot: string;
  amount: string;
  status: 'completed' | 'charging' | 'scheduled';
  date: string;
}

export const PastBookings: React.FC = () => {
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);

  // Mock data for past bookings
  const pastBookings: Booking[] = [
    { id: 1, bunkName: 'Delhi Metro Station', slot: 'A-12', amount: '₹250', status: 'completed', date: '2023-06-15' },
    { id: 2, bunkName: 'Mumbai Central', slot: 'B-07', amount: '₹180', status: 'completed', date: '2023-06-10' },
    { id: 3, bunkName: 'Bangalore IT Park', slot: 'C-22', amount: '₹320', status: 'charging', date: '2023-06-05' },
    { id: 4, bunkName: 'Chennai Airport', slot: 'D-15', amount: '₹450', status: 'completed', date: '2023-05-28' },
    { id: 5, bunkName: 'Hyderabad Tech Park', slot: 'E-08', amount: '₹210', status: 'scheduled', date: '2023-06-20' },
  ];

  const toggleHistoryPanel = () => {
    setIsHistoryPanelOpen(!isHistoryPanelOpen);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-[#10B981]/20 text-[#10B981]';
      case 'charging':
        return 'bg-[#F59E0B]/20 text-[#F59E0B]';
      case 'scheduled':
        return 'bg-[#8B5CF6]/20 text-[#8B5CF6]';
      default:
        return 'bg-[#94A3B8]/20 text-[#94A3B8]';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'charging':
        return 'Charging';
      case 'scheduled':
        return 'Scheduled';
      default:
        return status;
    }
  };

  return (
    <section id="history" className="py-12 bg-[#1E293B] relative overflow-hidden">
      {/* Background energy animations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-10 right-10 w-16 h-16 opacity-10">
          <EnergyAnimation />
        </div>
      </div>
      
      <div className="container mx-auto relative z-10">
        <motion.div 
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-white">Recent Bookings</h2>
          <Button 
            onClick={toggleHistoryPanel}
            variant="outline"
            className="border-[#475569] text-[#CBD5E1] hover:bg-[#334155]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View All
          </Button>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pastBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              className="bg-[#334155]/50 backdrop-blur-sm rounded-xl p-6 border border-[#475569]/50 relative overflow-hidden"
              whileHover={{ 
                scale: 1.03,
                boxShadow: "0 0 15px rgba(139, 92, 246, 0.2), 0 0 25px rgba(16, 185, 129, 0.2)"
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Inner energy animation */}
              <div className="absolute -top-4 -right-4 w-16 h-16 opacity-10">
                <EnergyAnimation />
              </div>
              
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <h3 className="font-semibold text-white">{booking.bunkName}</h3>
                  <p className="text-sm text-[#94A3B8] mt-1">Slot: {booking.slot}</p>
                  <p className="text-sm text-[#94A3B8]">Date: {booking.date}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {getStatusText(booking.status)}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-[#475569]/50 relative z-10">
                <p className="text-lg font-bold text-white">₹{booking.amount}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};