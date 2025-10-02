"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Button } from '@/components/ui/Button';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import { 
  ChargingStatusCard, 
  PaymentHistoryCard, 
  NotificationBanner,
  MapSection,
  BusinessStats,
  EcoJourneyHighlights
} from '@/components/dashboard';
import { useLoader } from '@/lib/LoaderContext'; 

interface ChargingSession {
  userId: string;
  stationId: string;
  slotId: string;
  startTime: string;
  endTime: string;
  totalEnergyKWh: number;
  totalCost: number;
  paymentStatus: string;
  location: string;
  progress: number;
  timeRemaining: number;
  energyConsumed: number;
}

interface Payment {
  userId: string;
  paymentId: string;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
  updatedAt: string;
  date?: string; 
  id?: string;
  orderId?: string;
  stationId?: string;
  slotId?: string;
  duration?: number;
  currency?: string;
}

interface SlotAvailability {
  stationId: string;
  stationName: string;
  slotsAvailable: number;
  waitingTime: string;
  location: string;
}

export default function ClientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeSession, setActiveSession] = useState<ChargingSession | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [slotAvailability, setSlotAvailability] = useState<SlotAvailability[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<any>(null);
  const { showLoader, hideLoader } = useLoader();
  const dataFetchedRef = useRef(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      // Hide loader and redirect to login
      hideLoader();
      setLoading(false);
      router.push("/login");
    }
  }, [status, router, hideLoader]);

  // Show loader immediately when component mounts and user is authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id && !dataFetchedRef.current) {
      showLoader("Loading your dashboard...");
      setLoading(true);
    }
  }, [status, session, showLoader]);

  // Cleanup function to ensure loader is hidden when component unmounts
  useEffect(() => {
    return () => {
      hideLoader();
    };
  }, [hideLoader]);

  // Fetch initial dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (status !== "authenticated" || !session?.user?.id) {
      // Hide loader if not authenticated
      if (loading) {
        hideLoader();
        setLoading(false);
      }
      return;
    }

    try {
      setError(null);
      
      // Show loader during data fetching
      if (!loading) {
        showLoader("Loading your dashboard...");
        setLoading(true);
      }
      
      // Add timeout to ensure loader doesn't stay visible indefinitely
      const timeoutId = setTimeout(() => {
        hideLoader();
        setLoading(false);
      }, 10000); // 10 second timeout
      
      // Fetch active charging session
      const sessionResponse = await fetch(`/api/dashboard/session?userId=${session.user.id}`);
      if (!sessionResponse.ok) {
        throw new Error('Failed to fetch session data');
      }
      const sessionData = await sessionResponse.json();
      setActiveSession(sessionData);

      // Fetch payment history
      const paymentResponse = await fetch(`/api/dashboard/payments?userId=${session.user.id}`);
      if (!paymentResponse.ok) {
        throw new Error('Failed to fetch payment data');
      }
      const paymentData = await paymentResponse.json();
      setPaymentHistory(paymentData);

      // Fetch slot availability
      const slotResponse = await fetch(`/api/dashboard/slots?userId=${session.user.id}`);
      if (!slotResponse.ok) {
        throw new Error('Failed to fetch slot availability data');
      }
      const slotData = await slotResponse.json();
      setSlotAvailability(slotData);

      // Clear timeout if data fetching completes successfully
      clearTimeout(timeoutId);
      
      setLoading(false);
      hideLoader(); // Hide loader after data is fetched
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again later.");
      setLoading(false);
      hideLoader(); // Hide loader even if there's an error
    }
  }, [status, session, showLoader, hideLoader, loading]);

  // Fetch data on component mount
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id && !dataFetchedRef.current) {
      dataFetchedRef.current = true;
      fetchDashboardData();
    } else if (status !== "loading" && !session?.user?.id) {
      // Hide loader if not authenticated or session is not loading
      hideLoader();
      setLoading(false);
    }
  }, [status, session, fetchDashboardData, hideLoader]);

  // Show loader immediately when component mounts to prevent background flash
  useEffect(() => {
    if (status === "authenticated") {
      showLoader("Loading your dashboard...");
    }
  }, [status, showLoader]);

  // Handle book slot action
  const handleBookSlot = () => {
    // Redirect to find-bunks page for booking
    router.push('/find-bunks');
  };

  // Handle view history action
  const handleViewHistory = () => {
    // Navigate to payment history page
    router.push('/dashboard/client/payment-history');
  };

  if (status === "loading" || loading) {
    // Don't return null, render the page with loader context handling it
    // The loader will be displayed via LoaderContext
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155]">
        <Navbar />
        {/* Loader will be displayed via LoaderContext */}
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // Will be redirected
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155] flex items-center justify-center relative overflow-hidden">
        <div className="relative z-10 text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:from-[#7C3AED] hover:to-[#059669] text-white"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155]">
      <Navbar />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Notification Banner */}
          {notification && (
            <div className="mb-6">
              <NotificationBanner 
                message={notification.message} 
                type={notification.type} 
                onClose={() => setNotification(null)} 
              />
            </div>
          )}

          {/* Welcome Section */}
          <div className="mb-10 rounded-2xl bg-gradient-to-br from-[#1E3A5F]/50 to-[#0F2A4A]/30 p-6 border border-[#475569]/50">
            <h1 className="text-2xl md:text-3xl font-bold text-[#F1F5F9] mb-2">
              Welcome back, {session?.user?.name || 'User'}
            </h1>
            <p className="text-[#CBD5E1]">
              Proud to be part of the EV revolution – Together reducing CO2 and building a greener future.
            </p>
          </div>

          {/* Stats Section - Replacing 'No Active Charging Session' */}
          <div className="mb-10">
            <BusinessStats />
          </div>

          {/* Eco Journey Highlights - Replacing Quick Actions */}
          <div className="mb-10">
            <EcoJourneyHighlights />
          </div>

          {/* Map Section */}
          <div className="mb-10">
            <MapSection onBookPay={handleBookSlot} />
          </div>

          {/* Charging Session Tracker */}
          <div className="mb-10">
            <ChargingStatusCard 
              session={activeSession} 
              onCancelSession={() => {
                // Implementation for canceling session
                alert("Cancel session functionality would be implemented here");
              }} 
            />
          </div>

          {/* Payment History */}
          <PaymentHistoryCard payments={paymentHistory} onViewAll={handleViewHistory} />
        </div>
      </main>
    </div>
  );
}