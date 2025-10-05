"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { useRouteTransition } from '@/hooks/useRouteTransition';
import { FetchingAnimation } from '@/components/dashboard/FetchingAnimation';

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
  stationName?: string;
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
  const { showLoader, hideLoader } = useLoader();
  const [activeSession, setActiveSession] = useState<ChargingSession | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [slotAvailability, setSlotAvailability] = useState<SlotAvailability[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<any>(null);
  
  // Clear the navigation flag on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('navigatingToDashboard');
    }
  }, []);
  
  // Initialize route transition handler
  useRouteTransition();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      setLoading(false);
      router.push("/login");
    }
  }, [status, router]);

  // Cleanup function to ensure loader is hidden when component unmounts
  useEffect(() => {
    return () => {
      // Disconnect socket on component unmount
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Initialize socket connection and set up listeners
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      // Initialize socket connection
      socketRef.current = io({
        path: "/api/socketio"
      });

      // Join user room
      socketRef.current.emit("join-user-room", session.user.id);

      // Listen for payment updates
      socketRef.current.on("payment-update", (data: any) => {
        console.log("Received payment update:", data);
        
        // Show loader while processing update
        showLoader("Updating payment information...");
        
        // Transform the incoming payment data to match the expected structure
        const updatedPayment: Payment = {
          userId: data.payment.userId || session.user.id || '',
          paymentId: data.payment.paymentId || '',
          amount: data.payment.amount || 0,
          status: data.payment.status || 'unknown',
          method: data.payment.method || 'Razorpay',
          createdAt: data.payment.date || new Date().toISOString(),
          updatedAt: data.payment.date || new Date().toISOString(),
          date: data.payment.date || '',
          stationName: data.payment.stationName || 'Unknown Station',
          // Add other fields with default values
          orderId: '',
          stationId: '',
          slotId: '',
          duration: 1,
          currency: 'INR',
          id: data.payment.paymentId || ''
        };

        // Update payment history with the new payment
        setPaymentHistory(prevPayments => {
          // Create a new array with the updated payment
          const updatedPayments = [...prevPayments];
          
          // Check if this payment already exists in the list
          const existingIndex = updatedPayments.findIndex(
            p => p.paymentId === updatedPayment.paymentId
          );
          
          if (existingIndex !== -1) {
            // Update existing payment
            updatedPayments[existingIndex] = updatedPayment;
          } else {
            // Add new payment to the beginning of the list
            updatedPayments.unshift(updatedPayment);
          }
          
          // Sort by date (newest first) and keep only the 5 most recent
          return updatedPayments
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
        });
        
        // Show notification for payment update
        setNotification({
          message: `Payment ${data.status.toLowerCase()} - ₹${data.payment.amount}`,
          type: data.status.toLowerCase() === 'completed' ? 'success' : 'info'
        });
        
        // Hide loader after processing
        hideLoader();
        
        // Auto-hide notification after 5 seconds
        setTimeout(() => {
          setNotification(null);
        }, 5000);
      });

      // Clean up socket listeners
      return () => {
        if (socketRef.current) {
          socketRef.current.off("payment-update");
          socketRef.current.disconnect();
        }
      };
    }
    
    // Return a no-op cleanup function for cases where the effect doesn't run
    return () => {};
  }, [status, session?.user?.id, showLoader, hideLoader]);

  // Fetch initial dashboard data - simplified version
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (status !== "authenticated" || !session?.user?.id) {
        return;
      }

      try {
        if (isMounted) {
          setError(null);
          
          setLoading(true);
          showLoader("Loading dashboard...");
        }

        // Fetch active charging session
        const sessionResponse = await fetch(`/api/dashboard/session?userId=${session.user.id}`);
        if (!sessionResponse.ok) {
          throw new Error('Failed to fetch session data');
        }
        const sessionData = await sessionResponse.json();
        
        if (isMounted) {
          setActiveSession(sessionData);
        }

        // Fetch payment history using the same service as the payment history page
        const paymentResponse = await fetch(`/api/dashboard/payments?userId=${session.user.id}`);
        if (!paymentResponse.ok) {
          throw new Error('Failed to fetch payment data');
        }
        const paymentData = await paymentResponse.json();
        
        // Transform payment data to ensure it matches the expected structure
        const transformedPaymentData = Array.isArray(paymentData) ? paymentData.map((payment: any) => ({
          // Ensure all required fields are present with proper defaults
          userId: payment.userId || session.user.id || '',
          paymentId: payment.paymentId || payment.id || payment._id || '',
          amount: payment.amount || 0,
          status: payment.status || 'unknown',
          method: payment.method || 'unknown',
          createdAt: payment.createdAt || payment.updatedAt || new Date().toISOString(),
          updatedAt: payment.updatedAt || payment.createdAt || new Date().toISOString(),
          // Optional fields
          date: payment.date || payment.createdAt || payment.updatedAt || '',
          stationId: payment.stationId || '',
          stationName: payment.stationName || payment.station?.name || 'Unknown Station',
          slotId: payment.slotId || '',
          duration: payment.duration || 0,
          orderId: payment.orderId || '',
          currency: payment.currency || 'INR',
          // Use _id as id if id is not present
          id: payment.id || payment._id || payment.paymentId || ''
        })) : [];
        
        if (isMounted) {
          // Sort by date (newest first) and keep only the 5 most recent
          const sortedPayments = transformedPaymentData
            .sort((a: Payment, b: Payment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
          setPaymentHistory(sortedPayments);
        }

        // Fetch slot availability
        const slotResponse = await fetch(`/api/dashboard/slots?userId=${session.user.id}`);
        if (!slotResponse.ok) {
          throw new Error('Failed to fetch slot availability data');
        }
        const slotData = await slotResponse.json();
        
        if (isMounted) {
          setSlotAvailability(slotData);
          setLoading(false);
          hideLoader();
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        if (isMounted) {
          setError("Failed to load dashboard data. Please try again later.");
          setLoading(false);
          hideLoader();
        }
      }
    };

    if (status === "authenticated" && session?.user?.id) {
      fetchData();
    } else if (status !== "loading" && !session?.user?.id) {
      // Hide loader if not authenticated or session is not loading
      setLoading(false);
      hideLoader();
    }

    return () => {
      isMounted = false;
    };
  }, [status, session?.user?.id, showLoader, hideLoader]); // Simplified dependencies

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

  if (status === "loading" || loading) {
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
              <div className="mb-10 rounded-2xl bg-gradient-to-br from-[#1E3A5F]/50 to-[#0F2A4A]/30 p-6 border border-[#475569]/50">
                <h1 className="text-2xl md:text-3xl font-bold text-[#F1F5F9] mb-2">
                  Welcome back, {session?.user?.name || 'User'}
                </h1>
                <p className="text-[#CBD5E1]">
                  Proud to be part of the EV revolution – Together reducing CO2 and building a greener future.
                </p>
              </div>
              <div className="flex justify-center items-center min-h-[200px]">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B5CF6] mb-4"></div>
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
            <div className="mb-10 rounded-2xl bg-gradient-to-br from-[#1E3A5F]/50 to-[#0F2A4A]/30 p-6 border border-[#475569]/50">
              <h1 className="text-2xl md:text-3xl font-bold text-[#F1F5F9] mb-2">
                Welcome back, {session?.user?.name || 'User'}
              </h1>
              <p className="text-[#CBD5E1]">
                Proud to be part of the EV revolution – Together reducing CO2 and building a greener future.
              </p>
            </div>
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="text-[#CBD5E1]">Loading dashboard...</div>
            </div>
          </div>
        </main>
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
            <JourneyImpactStats />
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

          {/* Payment History - Now with real-time updates */}
          <PaymentHistoryCard payments={Array.isArray(paymentHistory) ? paymentHistory : []} onViewAll={handleViewHistory} />
        </div>
      </main>
      <Footer />
    </div>
  );
}