"use client";

import React, { useState, useEffect } from 'react';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { 
  Navbar,
  HeroSection,
  StatsSection,
  FeaturesSection,
  HowItWorksSection,
  MapSection,
  PaymentSection,
  TestimonialsSection,
  CTASection,
  Footer
} from '@/components/landing';
import { useSession } from "next-auth/react";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";
  const [wasLoggedIn, setWasLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user was previously logged in
    const storedSession = localStorage.getItem('userSession');
    if (storedSession) {
      setWasLoggedIn(true);
    }
    
    // Check if we should show the loading screen
    const hasSeenLoadingScreen = localStorage.getItem('hasSeenLoadingScreen');
    const showLoadingAfterLogin = localStorage.getItem('showLoadingAfterLogin');
    const shouldShowLoading = !hasSeenLoadingScreen || showLoadingAfterLogin || !storedSession;

    if (shouldShowLoading) {
      // Set loading screen timeout
      const timer = setTimeout(() => {
        setLoading(false);
        // Mark that user has seen the loading screen
        localStorage.setItem('hasSeenLoadingScreen', 'true');
        // Remove the flag so loading screen doesn't show again until next login
        localStorage.removeItem('showLoadingAfterLogin');
        // Store session info
        if (session?.user) {
          localStorage.setItem('userSession', JSON.stringify(session.user));
        }
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      // Skip loading screen
      setLoading(false);
      // Store session info
      if (session?.user) {
        localStorage.setItem('userSession', JSON.stringify(session.user));
      } else {
        // Clear session info if user is not logged in
        localStorage.removeItem('userSession');
      }
    }
  }, [session?.user]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#1E293B]">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <MapSection />
      <PaymentSection />
      <TestimonialsSection />
      {/* Only show CTA section if user is not logged in */}
      {!session?.user && <CTASection />}
      <Footer />
    </div>
  );
}