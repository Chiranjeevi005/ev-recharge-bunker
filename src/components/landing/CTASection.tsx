"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useSession } from "next-auth/react";

export const CTASection: React.FC = () => {
  const { data: session } = useSession();

  // If user is logged in, don't show the CTA section
  if (session?.user) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 px-4 bg-gradient-to-br from-[#1E293B] to-[#334155] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] opacity-10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] opacity-10 blur-3xl animate-pulse"></div>
      </div>
      
      <div className="container mx-auto max-w-4xl text-center relative z-10">
        <div>
          <h2 className="text-responsive-2xl font-bold text-[#F1F5F9] mb-4 sm:mb-6">
            Ready to Join the <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] to-[#10B981]">EV Revolution</span>?
          </h2>
          <p className="text-base sm:text-lg text-[#CBD5E1] mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
            Sign up today and get your first charging session at 50% off. Experience the future of electric mobility with EV Bunker.
          </p>
          
          <div className="inline-block">
            <Link href="/register">
              <Button 
                size="md" 
                className="bg-gradient-to-r from-[#8B5CF6] via-[#10B981] to-[#059669] text-white px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-bold relative overflow-hidden"
              >
                <span className="relative z-10">Get Started Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] via-[#059669] to-[#047857] opacity-0 hover:opacity-100 transition-opacity duration-300 z-0"></div>
                {/* Wave animation */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-wave"></div>
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};