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
  const [paymentLoading, setPaymentLoading] = useState(true);

  // Redirect if user is not a client
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role && session.user.role !== 'client') {
      // Redirect to appropriate dashboard based on role
      if (session.user.role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/unauthorized');
      }
    }
  }, [session, status, router]);

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

  // Redirect if not authenticated or not a client
  if (status === "unauthenticated" || !session || session.user?.role !== 'client') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155]">
      <Navbar />
      <main className="pt-16 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-6 sm:mb-8 rounded-2xl bg-gradient-to-br from-[#1E3A5F]/50 to-[#0F2A4A]/30 p-4 sm:p-6 border border-[#475569]/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] mb-1 sm:mb-2">
                  Welcome back, {session.user?.name || 'User'}
                </h1>
                <p className="text-sm sm:text-base text-[#CBD5E1]">
                  Proud to be part of the EV revolution – Together reducing CO2 and building a greener future.
                </p>
              </div>
              <div className="flex flex-col sm:items-end">
                <Button 
                  onClick={() => router.push('/find-bunks')}
                  className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#7C3AED] hover:to-[#DB2777] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#8B5CF6]/30"
                >
                  Find Bunks
                </Button>
                <p className="text-xs text-[#94A3B8] mt-2">Book your next charging session</p>
              </div>
            </div>
          </div>
          
          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6">
            {stats.map((stat: any) => (
              <Card key={stat.id} className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-3 sm:p-4 md:p-6 hover:border-[#8B5CF6] transition-all duration-300 hover:shadow-lg hover:shadow-[#8B5CF6]/20">
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
          
          {/* Main Content Grid - Single Page Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
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
              <Card className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-[#F1F5F9] mb-4">Find Nearby Bunks</h2>
                <div className="h-64 sm:h-80 rounded-lg bg-gradient-to-br from-[#0F2A4A] to-[#1E3A5F] border border-[#334155] flex items-center justify-center">
                  <MapSection onBookPay={handleBookFromMap} />
                </div>
                <div className="mt-4 flex justify-center">
                  <Button 
                    onClick={() => router.push('/find-bunks')}
                    className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#7C3AED] hover:to-[#DB2777] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
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
            <div className="space-y-4 sm:space-y-6">
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