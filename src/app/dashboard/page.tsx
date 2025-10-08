"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/common/Button';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import { 
  ChargingStatusCard, 
  PaymentHistoryCard, 
  NotificationBanner,
  MapSection,
  BusinessStats,
  JourneyImpactStats
} from '@/components/dashboard';
import { useLoader } from '@/context/LoaderContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import Toast from '@/components/common/Toast';

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

function DashboardContent() {
  const { data: session, status } = useSession() as { data: Session | null; status: "loading" | "authenticated" | "unauthenticated" };
  const router = useRouter();
  const { hideLoader, showLoader } = useLoader();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'impact'>('overview');
  const [chargingStatus, setChargingStatus] = useState<'available' | 'charging' | 'completed' | 'offline' | 'maintenance'>('available');
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<any>(null);
  const dataFetchedRef = useRef(false);

  // Handle book slot action
  const handleBookSlot = useCallback(() => {
    // Redirect to find-bunks page for booking
    router.push('/find-bunks');
  }, [router]);

  // Handle view history action
  const handleViewHistory = useCallback(() => {
    // Navigate to payment history page (original)
    router.push('/dashboard/client/payment-history');
  }, [router]);

  const handleCancelSession = () => {
    // In a real app, you would call your API to cancel the session
    console.log("Cancel session functionality would be implemented here");
    setToast({ message: "Cancel session functionality would be implemented here", type: 'info' });
  };

  if (status === "loading") {
    // Check if we're navigating from the navbar to avoid flashing loaders
    const fromNavbar = typeof window !== 'undefined' && 
      sessionStorage.getItem('navigatingToDashboard') === 'true';
    
    // Only show fetching animation if not navigating from navbar
    if (!fromNavbar) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155]">
          <Navbar />
          <main className="pt-20 pb-12">
            <div className="container mx-auto px-4">
              <div className="mb-6 sm:mb-8 rounded-2xl bg-gradient-to-br from-[#1E3A5F]/50 to-[#0F2A4A]/30 p-4 sm:p-6 border border-[#475569]/50">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#F1F5F9] mb-2">
                  Welcome back, {session?.user?.name || 'User'}
                </h1>
                <p className="text-sm sm:text-base text-[#CBD5E1]">
                  Proud to be part of the EV revolution – Together reducing CO2 and building a greener future.
                </p>
              </div>
              <div className="flex justify-center items-center min-h-[200px]">
                <div className="text-center">
                  <LoadingSpinner size="lg" className="mb-4" />
                  <p className="text-[#CBD5E1] text-lg font-medium">Loading dashboard...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      );
    }
    
    // If navigating from navbar, just show a minimal UI without loader
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155]">
        <Navbar />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4">
            <div className="mb-6 sm:mb-8 rounded-2xl bg-gradient-to-br from-[#1E3A5F]/50 to-[#0F2A4A]/30 p-4 sm:p-6 border border-[#475569]/50">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#F1F5F9] mb-2">
                Welcome back, {session?.user?.name || 'User'}
              </h1>
              <p className="text-sm sm:text-base text-[#CBD5E1]">
                Proud to be part of the EV revolution – Together reducing CO2 and building a greener future.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (status === "unauthenticated") {
    // Redirect to login page if not authenticated
    useEffect(() => {
      router.push('/login');
    }, [router]);
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155]">
      <Navbar />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-6 sm:mb-8 rounded-2xl bg-gradient-to-br from-[#1E3A5F]/50 to-[#0F2A4A]/30 p-4 sm:p-6 border border-[#475569]/50">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#F1F5F9] mb-2">
              Welcome back, {session?.user?.name || 'User'}
            </h1>
            <p className="text-sm sm:text-base text-[#CBD5E1]">
              Proud to be part of the EV revolution – Together reducing CO2 and building a greener future.
            </p>
          </div>
          
          {/* Notification Banner */}
          <div className="mb-4 sm:mb-6">
            <NotificationBanner 
              message="⚡ New feature: Track your environmental impact in real-time!" 
              type="info"
              onClose={() => console.log('Notification closed')}
            />
          </div>
          
          {/* Tab Navigation */}
          <div className="flex overflow-x-auto border-b border-[#475569] mb-4 sm:mb-6 pb-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-3 sm:py-3 sm:px-6 text-sm sm:text-base font-medium whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`py-2 px-3 sm:py-3 sm:px-6 text-sm sm:text-base font-medium whitespace-nowrap ${
                activeTab === 'map'
                  ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              Map View
            </button>
            <button
              onClick={() => setActiveTab('impact')}
              className={`py-2 px-3 sm:py-3 sm:px-6 text-sm sm:text-base font-medium whitespace-nowrap ${
                activeTab === 'impact'
                  ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              My Impact
            </button>
          </div>
          
          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div className="space-y-4 sm:space-y-6">
                <ChargingStatusCard 
                  status={chargingStatus}
                  stationName="Green Energy Hub"
                  slotId="SL-7890"
                  startTime="2023-06-15T14:30:00Z"
                  endTime="2023-06-15T16:45:00Z"
                  onCancel={handleCancelSession}
                />
                
                <PaymentHistoryCard 
                  payments={paymentHistory}
                  loading={false}
                  onViewAll={handleViewHistory}
                />
              </div>
              
              <div className="pt-2 sm:pt-4">
                <BusinessStats />
              </div>
            </div>
          )}
          
          {activeTab === 'map' && (
            <div className="pt-2">
              <MapSection 
                onBookPay={handleBookSlot}
              />
            </div>
          )}
          
          {activeTab === 'impact' && (
            <div className="pt-2">
              <JourneyImpactStats />
            </div>
          )}
        </div>
      </main>
      
      <Footer />
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardContent />
    </Suspense>
  );
}