"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/Button';
import { SuccessAnimation } from '@/components/ui/SuccessAnimation';

interface Booking {
  _id: string;
  userId: string;
  stationId: string;
  slotId: string;
  startTime: string;
  endTime: string;
  amount: number;
  paymentId: string;
  status: string;
  createdAt: string;
}

interface Station {
  _id: string;
  name: string;
  address: string;
  city: string;
  slots: {
    slotId: string;
    status: "available" | "occupied" | "maintenance";
    chargerType: string;
    pricePerHour: number;
  }[];
}

export default function ConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setError('No booking ID provided');
      setLoading(false);
      return;
    }

    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch specific booking details
        const bookingResponse = await fetch(`/api/bookings/${bookingId}`);
        const bookingData = await bookingResponse.json();
        
        if (!bookingResponse.ok || bookingData.error) {
          setError(bookingData.error || 'Booking not found');
          setLoading(false);
          return;
        }
        
        setBooking(bookingData);
        
        // Fetch station details
        const stationResponse = await fetch(`/api/stations`);
        const stations = await stationResponse.json();
        const foundStation = stations.find((s: Station) => s._id === bookingData.stationId);
        
        if (foundStation) {
          setStation(foundStation);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Failed to load booking details. Please try again.');
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex items-center justify-center">
        <div className="text-[#F1F5F9]">Loading booking details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex items-center justify-center">
        <div className="text-[#F1F5F9] text-center">
          <div className="text-red-400 mb-4">Error: {error}</div>
          <Button 
            onClick={() => router.push('/dashboard/client')}
            className="bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:from-[#7C3AED] hover:to-[#059669] text-white"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex items-center justify-center">
        <div className="text-[#F1F5F9] text-center">
          <div className="text-red-400 mb-4">Booking not found</div>
          <Button 
            onClick={() => router.push('/dashboard/client')}
            className="bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:from-[#7C3AED] hover:to-[#059669] text-white"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (start: string, end: string) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diffInHours = (endTime - startTime) / (1000 * 60 * 60);
    return diffInHours.toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B]">
      <Navbar />
      
      <main className="pt-16 pb-12">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            {/* Success Header */}
            <div className="text-center mb-10">
              <div className="flex justify-center mb-6">
                <SuccessAnimation />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Payment Successful!
              </h1>
              <p className="text-[#94A3B8] text-lg">
                Your booking has been confirmed
              </p>
            </div>

            {/* Booking Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[#1E293B] border border-[#334155] rounded-xl shadow-xl overflow-hidden mb-8"
            >
              <div className="bg-gradient-to-r from-[#8B5CF6] to-[#10B981] p-1"></div>
              
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      Booking Confirmation
                    </h2>
                    <p className="text-[#94A3B8]">
                      Booking ID: {booking._id}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900/30 text-green-400 border border-green-800/50">
                      <svg className="mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      Confirmed
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Station Information */}
                  <div className="bg-[#334155]/30 rounded-lg p-5 border border-[#475569]/50">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      Station Details
                    </h3>
                    <div className="space-y-2">
                      <p className="text-[#F1F5F9] font-medium">
                        {station?.name || 'Loading station name...'}
                      </p>
                      <p className="text-[#94A3B8] text-sm">
                        {station?.address || 'Loading address...'}
                      </p>
                      <p className="text-[#94A3B8] text-sm">
                        {station?.city || 'Loading city...'}
                      </p>
                    </div>
                  </div>

                  {/* Booking Information */}
                  <div className="bg-[#334155]/30 rounded-lg p-5 border border-[#475569]/50">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      Booking Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[#94A3B8]">Slot ID:</span>
                        <span className="text-[#F1F5F9] font-medium">{booking.slotId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#94A3B8]">Duration:</span>
                        <span className="text-[#F1F5F9] font-medium">
                          {booking.startTime && booking.endTime 
                            ? `${calculateDuration(booking.startTime, booking.endTime)} hours` 
                            : 'Calculating...'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#94A3B8]">Amount Paid:</span>
                        <span className="text-[#10B981] font-bold text-lg">₹{booking.amount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Information */}
                <div className="bg-gradient-to-r from-[#334155]/50 to-[#1E293B]/50 rounded-lg p-5 border border-[#475569]/50 mb-8">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Schedule
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[#94A3B8] text-sm mb-1">Start Time</p>
                      <p className="text-[#F1F5F9] font-medium">
                        {booking.startTime ? formatDateTime(booking.startTime) : 'Loading...'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#94A3B8] text-sm mb-1">End Time</p>
                      <p className="text-[#F1F5F9] font-medium">
                        {booking.endTime ? formatDateTime(booking.endTime) : 'Loading...'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-[#334155]/30 rounded-lg p-5 border border-[#475569]/50">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                    </svg>
                    Payment Details
                  </h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[#94A3B8] text-sm">Payment ID</p>
                      <p className="text-[#F1F5F9] font-mono text-sm">{booking.paymentId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#94A3B8] text-sm">Status</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                onClick={() => router.push('/dashboard/client')}
                className="bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:from-[#7C3AED] hover:to-[#059669] text-white px-6 py-3"
              >
                View Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/find-bunks')}
                className="border-[#475569] text-[#F1F5F9] hover:bg-[#334155] px-6 py-3"
              >
                Book Another Slot
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}