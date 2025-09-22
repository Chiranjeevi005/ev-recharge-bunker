"use client";

import React, { useState, useEffect } from 'react';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { 
  HeroSection,
  StatsSection,
  FeaturesSection,
  HowItWorksSection,
  MapSection,
  PaymentSection,
  TestimonialsSection,
  Footer
} from '@/components/landing';

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#1E293B]">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <MapSection />
      <PaymentSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
}