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
  BusinessStats,
  JourneyImpactStats,
  MapSection,
  EcoJourneyHighlights
} from '@/components/dashboard';
import { useLoader } from '@/context/LoaderContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { Payment } from '@/types/payment';

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

// Define the slot type
interface Slot {
  slotId: string;
  status: "available" | "occupied" | "maintenance";
  chargerType: string;
  pricePerHour: number;
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
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(true);

  // Fetch payment history
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const fetchPaymentHistory = async () => {
        try {
          setPaymentLoading(true);
          const response = await fetch(`/api/payments?userId=${session.user.id}&limit=3`);
          if (response.ok) {
            const result = await response.json();
            // Extract data array from the response (API returns { success: true, data: [...] })
            const paymentsData = result.data || result || [];
            setPaymentHistory(paymentsData);
          } else {
            console.error("Failed to fetch payment history");
          }
        } catch (err) {
          console.error("Error fetching payment history:", err);
        } finally {
          setPaymentLoading(false);
        }
      };

      fetchPaymentHistory();
    }
  }, [status, session]);

  // Fetch slot availability
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const fetchSlotAvailability = async () => {
        try {
          setSlotsLoading(true);
          const response = await fetch(`/api/dashboard/slots?userId=${session.user.id}`);
          if (response.ok) {
            const result = await response.json();
            // Extract slots data from the response
            const slotsData = result.slots || [];
            setSlots(slotsData);
          } else {
            console.error("Failed to fetch slot availability");
            // Fallback to default slots
            setSlots([
              { slotId: 'SL-7890', status: 'available', chargerType: 'Fast Charger', pricePerHour: 50 },
              { slotId: 'SL-7891', status: 'occupied', chargerType: 'Standard Charger', pricePerHour: 30 },
              { slotId: 'SL-7892', status: 'maintenance', chargerType: 'Fast Charger', pricePerHour: 50 },
              { slotId: 'SL-7893', status: 'available', chargerType: 'Ultra Fast Charger', pricePerHour: 80 }
            ]);
          }
        } catch (err) {
          console.error("Error fetching slot availability:", err);
          // Fallback to default slots
          setSlots([
            { slotId: 'SL-7890', status: 'available', chargerType: 'Fast Charger', pricePerHour: 50 },
            { slotId: 'SL-7891', status: 'occupied', chargerType: 'Standard Charger', pricePerHour: 30 },
            { slotId: 'SL-7892', status: 'maintenance', chargerType: 'Fast Charger', pricePerHour: 50 },
            { slotId: 'SL-7893', status: 'available', chargerType: 'Ultra Fast Charger', pricePerHour: 80 }
          ]);
        } finally {
          setSlotsLoading(false);
        }
      };

      fetchSlotAvailability();
    }
  }, [status, session]);

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

  // Handle book slot from map
  const handleBookFromMap = () => {
    router.push('/find-bunks');
  };

  // Handle cancel session
  const handleCancelSession = () => {
    // In a real app, you would call your API to cancel the session
    console.log("Cancel session functionality would be implemented here");
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
      <main className="pt-16 p-1 xs:p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6">
        <div className="w-full mx-auto">
          {/* Welcome Section */}
          <div className="mb-3 xs:mb-4 sm:mb-5 md:mb-6 lg:mb-7 rounded-2xl bg-gradient-to-br from-[#1E3A5F]/50 to-[#0F2A4A]/30 p-2 xs:p-3 sm:p-4 md:p-5 border border-[#475569]/50 backdrop-blur-sm">
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-3 sm:gap-4">
              <div className="text-center xs:text-left">
                <h1 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[#F1F5F9] mb-1">
                  Welcome back, {session.user?.name || 'User'}
                </h1>
                <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-[#CBD5E1]">
                  Proud to be part of the EV revolution – Together reducing CO2 and building a greener future.
                </p>
              </div>
              <div className="flex flex-col items-center xs:items-end">
                <Button 
                  onClick={() => router.push('/find-bunks')}
                  className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#7C3AED] hover:to-[#DB2777] text-white font-medium py-1.5 xs:py-2 sm:py-2.5 md:py-3 px-2 xs:px-3 sm:px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#8B5CF6]/30 text-[10px] xs:text-xs sm:text-sm md:text-base"
                >
                  Find Bunks
                </Button>
                <p className="text-[10px] xs:text-xs sm:text-sm text-[#94A3B8] mt-1">Book your next charging session</p>
              </div>
            </div>
          </div>
          
          {/* Stats Section */}
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-1 xs:gap-2 sm:gap-3 md:gap-4 mb-3 xs:mb-4 sm:mb-5 md:mb-6">
            {stats.map((stat: any) => (
              <Card key={stat.id} className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-2 xs:p-3 sm:p-4 md:p-5 hover:border-[#8B5CF6] transition-all duration-300 hover:shadow-lg hover:shadow-[#8B5CF6]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] xs:text-[10px] sm:text-xs md:text-sm font-medium text-[#CBD5E1]">{stat.name}</p>
                    <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-bold text-[#F1F5F9] mt-0.5">{stat.value}</p>
                  </div>
                  <div className="p-1 xs:p-1.5 sm:p-2 rounded-lg bg-[#8B5CF6]/20">
                    <svg className="w-3 xs:w-4 sm:w-5 md:w-6 h-3 xs:h-4 sm:h-5 md:h-6 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Main Content Grid - Single Page Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-2 xs:space-y-3 sm:space-y-4 md:space-y-5">
              {/* Charging Status */}
              <ChargingStatusCard 
                status={chargingStatus}
                stationName="Green Energy Hub"
                slotId="SL-7890"
                startTime="2023-06-15T14:30:00Z"
                endTime="2023-06-15T16:45:00Z"
                onCancel={handleCancelSession}
              />
              
              {/* Map Section */}
              <Card className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-2 xs:p-3 sm:p-4 md:p-5">
                <h2 className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-bold text-[#F1F5F9] mb-2 xs:mb-3">Find Nearby Bunks</h2>
                <div className="h-32 xs:h-40 sm:h-48 md:h-56 lg:h-64 xl:h-80 rounded-lg bg-gradient-to-br from-[#0F2A4A] to-[#1E3A5F] border border-[#334155] flex items-center justify-center">
                  <MapSection onBookPay={handleBookFromMap} />
                </div>
                <div className="mt-2 xs:mt-3 flex justify-center">
                  <Button 
                    onClick={() => router.push('/find-bunks')}
                    className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#7C3AED] hover:to-[#DB2777] text-white font-medium py-1 xs:py-1.5 sm:py-2 px-2 xs:px-3 sm:px-4 rounded-lg transition-all duration-300 text-[10px] xs:text-xs sm:text-sm md:text-base"
                  >
                    Explore All Bunks
                  </Button>
                </div>
              </Card>
              
              {/* Payment History */}
              <PaymentHistoryCard 
                payments={paymentHistory}
                loading={paymentLoading}
                onViewAll={handleViewHistory}
              />
            </div>
            
            {/* Right Column */}
            <div className="space-y-2 xs:space-y-3 sm:space-y-4 md:space-y-5">
              {/* Slot Availability */}
              <SlotAvailabilityCard 
                stationName="Green Energy Hub"
                slots={slots}
                loading={slotsLoading}
                onBookSlot={handleBookSlot}
              />
              
              {/* Business Stats */}
              <BusinessStats />
              
              {/* Environmental Impact */}
              <JourneyImpactStats />
              
              {/* Eco Highlights */}
              <EcoJourneyHighlights />
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