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