"use client";

import React, { useState } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { BookingPanel } from '@/components/dashboard/BookingPanel';
import { PastBookings } from '@/components/dashboard/PastBookings';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { MapSection } from '@/components/dashboard/MapSection';

export default function ClientDashboard() {
  const [isBookingPanelOpen, setIsBookingPanelOpen] = useState(false);

  const handleBookPay = () => {
    setIsBookingPanelOpen(true);
  };

  const closeBookingPanel = () => {
    setIsBookingPanelOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#1E293B]">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero / Map Section */}
        <MapSection onBookPay={handleBookPay} />
        
        {/* Quick Stats / Highlights */}
        <QuickStats />
        
        {/* Past Bookings / History */}
        <PastBookings />
      </main>

      {/* Booking / Payment Panel */}
      <BookingPanel isOpen={isBookingPanelOpen} onClose={closeBookingPanel} />

      {/* Floating Action Button */}
      <FloatingActionButton onClick={handleBookPay} />
    </div>
  );
}
