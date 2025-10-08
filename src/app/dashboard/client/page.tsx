"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  ChargingStatusCard, 
  PaymentHistoryCard, 
  SlotAvailabilityCard,
  NotificationBanner
} from '@/components/dashboard';
import { useLoader } from '@/context/LoaderContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Define the session type
interface Session {
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    role?: string;
  }
}

// Loading component for Suspense
function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155]">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-[#CBD5E1]">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ClientDashboardContent() {
  const { data: session, status } = useSession() as { data: Session | null; status: "loading" | "authenticated" | "unauthenticated" };
  const router = useRouter();
  const { hideLoader } = useLoader();
  
  const [stats, setStats] = useState([
    { id: 'evs-charged', name: 'EVs Charged', value: '1,245' },
    { id: 'active-bunks', name: 'Active Bunks', value: '89' },
    { id: 'trips-completed', name: 'Trips Completed', value: '3,421' },
    { id: 'co2-saved', name: 'CO2 Saved (kg)', value: '12,845' }
  ]);

  const [chargingStatus, setChargingStatus] = useState<'available' | 'charging' | 'completed' | 'offline' | 'maintenance'>('available');
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);

  // Handle book slot action
  const handleBookSlot = (slotId: string) => {
    // In a real app, you would navigate to the booking page or show a booking modal
    console.log(`Booking slot ${slotId}`);
    router.push(`/booking?slotId=${slotId}`);
  };

  // Handle view history action
  const handleViewHistory = () => {
    // Navigate to payment history page
    router.push('/dashboard/client/payment-history');
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155]">
        <Navbar />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mb-4" />
                <p className="text-[#CBD5E1]">Authenticating...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155]">
      <Navbar />
      <main className="pt-16 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] mb-1 sm:mb-2">Client Dashboard</h1>
            <p className="text-sm sm:text-base text-[#CBD5E1]">Welcome back, {session.user?.name || 'User'}</p>
          </div>
          
          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
            {stats.map((stat: any) => (
              <Card key={stat.id} className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-[#CBD5E1]">{stat.name}</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#F1F5F9] mt-1">{stat.value}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#8B5CF6]/20">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Notification Banner */}
          <div className="mb-4 sm:mb-6">
            <NotificationBanner 
              message="⚡ New feature: Track your environmental impact in real-time!" 
              type="info"
              onClose={() => console.log('Notification closed')}
            />
          </div>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {/* Charging Status and Payment History */}
            <div className="space-y-4 sm:space-y-6">
              <ChargingStatusCard 
                status={chargingStatus}
                stationName="Green Energy Hub"
                slotId="SL-7890"
                startTime="2023-06-15T14:30:00Z"
                endTime="2023-06-15T16:45:00Z"
              />
              
              <PaymentHistoryCard 
                payments={paymentHistory}
                loading={false}
                onViewAll={handleViewHistory}
              />
            </div>
            
            {/* Slot Availability */}
            <div>
              <SlotAvailabilityCard 
                stationName="Green Energy Hub"
                slots={[
                  { slotId: 'SL-7890', status: 'available', chargerType: 'Fast Charger', pricePerHour: 50 },
                  { slotId: 'SL-7891', status: 'occupied', chargerType: 'Standard Charger', pricePerHour: 30 },
                  { slotId: 'SL-7892', status: 'maintenance', chargerType: 'Fast Charger', pricePerHour: 50 },
                  { slotId: 'SL-7893', status: 'available', chargerType: 'Ultra Fast Charger', pricePerHour: 80 }
                ]}
                loading={false}
                onBookSlot={handleBookSlot}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ClientDashboard() {
  return (
    <Suspense fallback={<Loading />}>
      <ClientDashboardContent />
    </Suspense>
  );
}