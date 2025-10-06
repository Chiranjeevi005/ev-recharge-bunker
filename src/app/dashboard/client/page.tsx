"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { useRouter } from 'next/navigation';
import { useLoader } from '@/context/LoaderContext';
import { useRealTimeData } from '@/hooks/useRealTimeData';

export default function ClientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { hideLoader, showLoader } = useLoader();
  const dataFetchedRef = useRef(false);
  
  // State for UI elements
  const [stats, setStats] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [impact, setImpact] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState(true);

  // Fetch data with timeout handling
  const fetchData = useCallback(async () => {
    if (status === 'authenticated' && session?.user && !dataFetchedRef.current) {
      dataFetchedRef.current = true;
      
      // Show loader during data fetching
      showLoader("Loading your dashboard...");
      
      // Add timeout to ensure loader doesn't stay visible indefinitely
      const overallTimeoutId = setTimeout(() => {
        setError("Request timeout - please check your network connection and try again");
        hideLoader();
        setLoadingState(false);
      }, 30000); // Increased to 30 seconds for better reliability
      
      try {
        // Fetch all data with individual timeouts
        const [
          statsResponse,
          bookingsResponse,
          paymentsResponse,
          impactResponse
        ] = await Promise.all([
          // Fetch dashboard stats with timeout
          Promise.race([
            fetch('/api/dashboard/client-stats'),
            new Promise<Response>((_, reject) => 
              setTimeout(() => reject(new Error('Stats fetch timeout')), 20000)
            )
          ]),
          // Fetch bookings with timeout
          Promise.race([
            fetch('/api/bookings'),
            new Promise<Response>((_, reject) => 
              setTimeout(() => reject(new Error('Bookings fetch timeout')), 20000)
            )
          ]),
          // Fetch payments with timeout
          Promise.race([
            fetch('/api/payments'),
            new Promise<Response>((_, reject) => 
              setTimeout(() => reject(new Error('Payments fetch timeout')), 20000)
            )
          ]),
          // Fetch impact stats with timeout
          Promise.race([
            fetch('/api/dashboard/impact'),
            new Promise<Response>((_, reject) => 
              setTimeout(() => reject(new Error('Impact stats fetch timeout')), 20000)
            )
          ])
        ]);
        
        // Clear the overall timeout since we've successfully fetched data
        clearTimeout(overallTimeoutId);
        
        // Process responses
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
        
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setBookings(bookingsData);
        }
        
        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json();
          setPayments(paymentsData);
        }
        
        if (impactResponse.ok) {
          const impactData = await impactResponse.json();
          setImpact(impactData);
        }
        
        // Hide loader and set loading state to false
        hideLoader();
        setLoadingState(false);
      } catch (error: any) {
        setError(error.message);
        hideLoader();
        setLoadingState(false);
      }
    }
  }, [status, session?.user, showLoader, hideLoader]);

  // Fetch data on component mount
  useEffect(() => {
    if (status === 'authenticated' && session?.user && !dataFetchedRef.current) {
      fetchData();
    } else if (status !== 'loading' && !session) {
      // Hide loader and redirect if not authenticated
      hideLoader();
      router.push('/login');
    }
  }, [status, session, fetchData, hideLoader, router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      hideLoader();
      router.push('/login');
    }
  }, [session, status, router, hideLoader]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B5CF6] mb-4"></div>
          <p className="text-[#CBD5E1]">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155]">
      <Navbar />
      <main className="pt-16 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#F1F5F9] mb-2">Client Dashboard</h1>
            <p className="text-[#CBD5E1]">Welcome back, {session.user?.name || 'User'}</p>
          </div>
          
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            {stats.map((stat: any) => (
              <Card key={stat.id} className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#CBD5E1]">{stat.name}</p>
                    <p className="text-xl font-bold text-[#F1F5F9] mt-1">{stat.value}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#10B981] flex items-center justify-center text-white">
                    {stat.icon}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Bookings Section */}
            <Card className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-4 md:p-6">
              <h2 className="text-xl font-bold text-[#F1F5F9] mb-4">Recent Bookings</h2>
              <div className="space-y-3">
                {bookings.slice(0, 5).map((booking: any) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-[#334155]/50 rounded-lg">
                    <div>
                      <p className="text-[#F1F5F9] font-medium">{booking.stationName}</p>
                      <p className="text-[#CBD5E1] text-sm">{new Date(booking.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      booking.status === 'completed' 
                        ? 'bg-green-900/30 text-green-400' 
                        : booking.status === 'cancelled'
                          ? 'bg-red-900/30 text-red-400'
                          : 'bg-yellow-900/30 text-yellow-400'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
                {bookings.length === 0 && (
                  <p className="text-[#CBD5E1] text-center py-4">No bookings found</p>
                )}
              </div>
            </Card>
            
            {/* Payments Section */}
            <Card className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-4 md:p-6">
              <h2 className="text-xl font-bold text-[#F1F5F9] mb-4">Payment History</h2>
              <div className="space-y-3">
                {payments.slice(0, 5).map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-[#334155]/50 rounded-lg">
                    <div>
                      <p className="text-[#F1F5F9] font-medium">₹{payment.amount}</p>
                      <p className="text-[#CBD5E1] text-sm">{new Date(payment.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      payment.status === 'completed' 
                        ? 'bg-green-900/30 text-green-400' 
                        : payment.status === 'failed'
                          ? 'bg-red-900/30 text-red-400'
                          : 'bg-yellow-900/30 text-yellow-400'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                ))}
                {payments.length === 0 && (
                  <p className="text-[#CBD5E1] text-center py-4">No payments found</p>
                )}
              </div>
            </Card>
          </div>
          
          {/* Impact Section */}
          {impact && (
            <Card className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-4 md:p-6 mt-6">
              <h2 className="text-xl font-bold text-[#F1F5F9] mb-4">Your Environmental Impact</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-[#334155]/50 rounded-lg">
                  <p className="text-2xl font-bold text-[#8B5CF6]">{impact.co2Saved} kg</p>
                  <p className="text-[#CBD5E1] text-sm mt-1">CO2 Saved</p>
                </div>
                <div className="text-center p-4 bg-[#334155]/50 rounded-lg">
                  <p className="text-2xl font-bold text-[#10B981]">{impact.electricityUsed} kWh</p>
                  <p className="text-[#CBD5E1] text-sm mt-1">Electricity Used</p>
                </div>
                <div className="text-center p-4 bg-[#334155]/50 rounded-lg">
                  <p className="text-2xl font-bold text-[#F59E0B]">{impact.treesEquivalent}</p>
                  <p className="text-[#CBD5E1] text-sm mt-1">Trees Equivalent</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}