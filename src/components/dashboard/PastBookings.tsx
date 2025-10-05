"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/common/Button';

interface Booking {
  _id: string;
  stationId: string;
  slotId: string;
  amount: number;
  status: 'completed' | 'confirmed' | 'scheduled';
  createdAt: string;
  stationName?: string;
}

export const PastBookings: React.FC = () => {
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);

  // Fetch real booking data
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // In a real implementation, this would fetch from an API endpoint
        // For now, we'll use mock data to simulate the real data structure
        const mockBookings: Booking[] = [
          { 
            _id: '1', 
            stationId: 'station1', 
            slotId: 'A-12', 
            amount: 250, 
            status: 'completed', 
            createdAt: '2023-06-15T10:30:00Z',
            stationName: 'Delhi Metro Station'
          },
          { 
            _id: '2', 
            stationId: 'station2', 
            slotId: 'B-07', 
            amount: 180, 
            status: 'completed', 
            createdAt: '2023-06-10T14:15:00Z',
            stationName: 'Mumbai Central'
          },
          { 
            _id: '3', 
            stationId: 'station3', 
            slotId: 'C-22', 
            amount: 320, 
            status: 'confirmed', 
            createdAt: '2023-06-05T09:45:00Z',
            stationName: 'Bangalore IT Park'
          },
          { 
            _id: '4', 
            stationId: 'station4', 
            slotId: 'D-15', 
            amount: 450, 
            status: 'completed', 
            createdAt: '2023-05-28T16:20:00Z',
            stationName: 'Chennai Airport'
          },
          { 
            _id: '5', 
            stationId: 'station5', 
            slotId: 'E-08', 
            amount: 210, 
            status: 'scheduled', 
            createdAt: '2023-06-20T11:00:00Z',
            stationName: 'Hyderabad Tech Park'
          },
        ];
        setPastBookings(mockBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchBookings();
  }, []);

  const toggleHistoryPanel = () => {
    setIsHistoryPanelOpen(!isHistoryPanelOpen);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-[#10B981]/20 text-[#10B981]';
      case 'confirmed':
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
      case 'confirmed':
        return 'Charging';
      case 'scheduled':
        return 'Scheduled';
      default:
        return status;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <section id="history" className="py-12 bg-[#1E293B] relative overflow-hidden">
      {/* Background energy animations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-10 right-10 w-16 h-16 opacity-10">
          <div className="w-full h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] animate-pulse"></div>
        </div>
      </div>
      
      <div className="container mx-auto relative z-10">
        <motion.div 
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-white">Payment History</h2>
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
              key={booking._id}
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
                <div className="w-full h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] animate-pulse"></div>
              </div>
              
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <h3 className="font-semibold text-white">{booking.stationName || 'Unknown Station'}</h3>
                  <p className="text-sm text-[#94A3B8] mt-1">Slot: {booking.slotId}</p>
                  <p className="text-sm text-[#94A3B8]">Date: {formatDate(booking.createdAt)}</p>
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