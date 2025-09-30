"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/landing/Navbar';
import { Button } from '@/components/ui/Button';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import { ChargingStatusCard, SlotAvailabilityCard, PaymentHistoryCard, NotificationBanner } from '@/components/dashboard';

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
  date: string;
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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Initialize Socket.io connection
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      // Initialize socket connection
      socketRef.current = io({
        path: "/api/socketio",
        transports: ["polling", "websocket"],
      });

      // Join user room
      socketRef.current.emit("join-user-room", session.user.id);

      // Listen for charging session updates
      socketRef.current.on("charging-session-update", (data: any) => {
        console.log("Charging session update:", data);
        if (data.userId === session.user.id) {
          setActiveSession(data.session);
        }
      });

      // Listen for payment updates
      socketRef.current.on("payment-update", (data: any) => {
        console.log("Payment update:", data);
        if (data.userId === session.user.id) {
          setNotification({ message: `Payment ${data.status}`, type: data.status });
          // Update payment history with the new payment
          setPaymentHistory(prev => {
            // Check if payment already exists in history
            const existingIndex = prev.findIndex(p => p.paymentId === data.payment.paymentId);
            if (existingIndex >= 0) {
              // Update existing payment
              const updated = [...prev];
              updated[existingIndex] = data.payment;
              return updated;
            }
            // Add new payment to the beginning of the list
            return [data.payment, ...prev].slice(0, 10); // Keep only last 10 payments
          });
        }
      });

      // Listen for slot availability updates
      socketRef.current.on("slot-availability-update", (data: any) => {
        console.log("Slot availability update:", data);
        setSlotAvailability(prev => {
          const existingIndex = prev.findIndex(s => s.stationId === data.stationId);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = data;
            return updated;
          }
          return [...prev, data];
        });
      });

      // Listen for notifications
      socketRef.current.on("notification", (data: any) => {
        console.log("Notification:", data);
        setNotification({ message: data.message, type: data.type });
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [status, session]);

  // Fetch initial dashboard data
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const fetchDashboardData = async () => {
        try {
          setLoading(true);
          setError(null);
          
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

          setLoading(false);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
          setError("Failed to load dashboard data. Please try again later.");
          setLoading(false);
        }
      };

      fetchDashboardData();
    }
    // Only set loading to false if user is not authenticated
    else if (status !== "loading") {
      setLoading(false);
    }
  }, [status, session]);

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

  // Handle pay now action
  const handlePayNow = () => {
    // Redirect to find-bunks page for booking
    router.push('/find-bunks');
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155] flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 z-0">
          {/* Gradient shift animation */}
          <motion.div 
            className="absolute inset-0 opacity-20"
            animate={{
              background: [
                "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)",
                "radial-gradient(circle at 50% 20%, rgba(5, 150, 105, 0.15) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)"
              ]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          
          {/* Tech grid pattern */}
          <div className="absolute inset-0 opacity-10">
            {/* Horizontal lines */}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-[#8B5CF6]"
                style={{ left: `${i * 5}%` }}
                animate={{
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
            
            {/* Vertical lines */}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute left-0 right-0 h-px bg-[#10B981]"
                style={{ top: `${i * 5}%` }}
                animate={{
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="relative z-10 text-[#F1F5F9]">Loading your dashboard...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // Will be redirected
  }

  // Remove the separate loading check since it's now combined with status check

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155] flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 z-0">
          {/* Gradient shift animation */}
          <motion.div 
            className="absolute inset-0 opacity-20"
            animate={{
              background: [
                "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)",
                "radial-gradient(circle at 50% 20%, rgba(5, 150, 105, 0.15) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)"
              ]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </div>
        
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
    <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        {/* Gradient blobs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] opacity-10 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] opacity-10 blur-3xl"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute top-0 bottom-0 w-px bg-[#8B5CF6]" style={{ left: `${i * 5}%` }}></div>
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute left-0 right-0 h-px bg-[#10B981]" style={{ top: `${i * 5}%` }}></div>
          ))}
        </div>
      </div>
      
      <Navbar />
      
      <main className="pt-20 pb-12 relative z-10">
        <div className="container mx-auto px-4">
          {/* Notification Banner */}
          {notification && (
            <NotificationBanner 
              message={notification.message} 
              type={notification.type} 
              onClose={() => setNotification(null)} 
            />
          )}

          {/* Welcome Section */}
          <motion.div 
            className="mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-[#F1F5F9] mb-2">
              Welcome back, {session?.user?.name || 'User'}
            </h1>
            <p className="text-[#CBD5E1]">
              Manage your EV charging sessions and view your history
            </p>
          </motion.div>

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

          {/* Slot Availability and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <SlotAvailabilityCard 
              availability={slotAvailability} 
              onBookSlot={handleBookSlot} 
            />
            
            <motion.div
              className="glass rounded-2xl p-6 shadow-lg border border-[#475569]/50 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.15)] pointer-events-none"></div>
              
              <h2 className="text-2xl font-bold text-[#F1F5F9] mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button
                  onClick={handleBookSlot}
                  className="bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:from-[#7C3AED] hover:to-[#059669] text-white py-4"
                >
                  <div className="flex flex-col items-center">
                    <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    <span>Book Slot</span>
                  </div>
                </Button>
                
                <Button
                  onClick={handlePayNow}
                  className="bg-gradient-to-r from-[#F59E0B] to-[#EF4444] hover:from-[#D97706] hover:to-[#DC2626] text-white py-4"
                >
                  <div className="flex flex-col items-center">
                    <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>Pay Now</span>
                  </div>
                </Button>
                
                <Button
                  onClick={handleViewHistory}
                  variant="outline"
                  className="border-[#94A3B8] text-[#F1F5F9] hover:bg-[#475569]/50 py-4"
                >
                  <div className="flex flex-col items-center">
                    <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <span>View History</span>
                  </div>
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Payment History */}
          <PaymentHistoryCard payments={paymentHistory} onViewAll={handleViewHistory} />
        </div>
      </main>
      
      {/* Booking functionality now handled in find-bunks page */}
    </div>
  );
}