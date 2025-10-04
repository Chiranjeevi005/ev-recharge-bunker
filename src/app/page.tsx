"use client";

import React, { useState, useEffect } from 'react';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { 
  Navbar,
  HeroSection,
  StatsSection,
  FeaturesSection,
  HowItWorksSection,
  TestimonialsSection,
  CTASection,
  Footer
} from '@/components/landing';
import { useSession } from "next-auth/react";
import { useRouteTransition } from '@/hooks/useRouteTransition';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";
  const [wasLoggedIn, setWasLoggedIn] = useState(false);
  
  // Initialize route transition handler
  useRouteTransition();

  useEffect(() => {
    // Check for manual trigger via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const forceLoading = urlParams.get('forceLoading') === 'true';
    
    // Check if we're on localhost (development environment)
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' ||
       window.location.hostname === '[::1]');
    
    // Set a flag in sessionStorage to detect refresh
    const isRefresh = sessionStorage.getItem('isRefresh') === 'true';
    sessionStorage.setItem('isRefresh', 'true');
    
    // Check if user was previously logged in
    const storedSession = localStorage.getItem('userSession');
    if (storedSession) {
      setWasLoggedIn(true);
    }
    
    // Check if we should show the loading screen
    const hasSeenLoadingScreen = localStorage.getItem('hasSeenLoadingScreen');
    const showLoadingAfterLogin = localStorage.getItem('showLoadingAfterLogin');
    
    // Additional check for logo click redirection
    const isFromLogoClick = sessionStorage.getItem('fromLogoClick') === 'true';
    if (isFromLogoClick) {
      sessionStorage.removeItem('fromLogoClick'); // Clean up the flag
    }
    
    // Show loading screen when:
    // 1. For first-time visitors (hasSeenLoadingScreen is null)
    // 2. After login (showLoadingAfterLogin is set)
    // 3. On page refresh
    // 4. When manually triggered via URL parameter
    // 5. When on localhost (development environment)
    // BUT NOT when redirected from logo click
    const shouldShowLoading = !isFromLogoClick && (!hasSeenLoadingScreen || showLoadingAfterLogin || isRefresh || forceLoading || isLocalhost);

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
      }, 5000);

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
      // Return a cleanup function even when not showing loading screen
      return () => {};
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
      <TestimonialsSection />
      {/* Only show CTA section if user is not logged in */}
      {!session?.user && <CTASection />}
      <Footer />
    </div>
  );
}