"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useLoader } from '@/lib/LoaderContext'; // Import the universal loader context

// Predefined positions for particles to ensure SSR/CSR consistency
const particlePositions = [
  { width: 6, height: 6, top: "20%", left: "30%" },
  { width: 8, height: 8, top: "60%", left: "70%" },
  { width: 4, height: 4, top: "40%", left: "10%" },
  { width: 10, height: 10, top: "80%", left: "90%" },
  { width: 5, height: 5, top: "15%", left: "85%" },
  { width: 7, height: 7, top: "70%", left: "20%" },
  { width: 3, height: 3, top: "50%", left: "50%" },
  { width: 9, height: 9, top: "30%", left: "40%" },
  { width: 6, height: 6, top: "85%", left: "35%" },
  { width: 4, height: 4, top: "25%", left: "75%" },
  { width: 8, height: 8, top: "65%", left: "15%" },
  { width: 5, height: 5, top: "10%", left: "60%" },
];

// Predefined animation values for particles
const particleAnimations = [
  { y: [0, -30, 0], x: [0, 20, 0], duration: 12, delay: 0 },
  { y: [0, -20, 0], x: [0, -15, 0], duration: 15, delay: 1 },
  { y: [0, -25, 0], x: [0, 30, 0], duration: 13, delay: 0.5 },
  { y: [0, -15, 0], x: [0, -25, 0], duration: 17, delay: 2 },
  { y: [0, -35, 0], x: [0, 15, 0], duration: 14, delay: 1.5 },
  { y: [0, -20, 0], x: [0, -20, 0], duration: 16, delay: 0.8 },
  { y: [0, -30, 0], x: [0, 10, 0], duration: 18, delay: 2.5 },
  { y: [0, -25, 0], x: [0, -10, 0], duration: 11, delay: 1.2 },
  { y: [0, -15, 0], x: [0, 35, 0], duration: 19, delay: 0.3 },
  { y: [0, -40, 0], x: [0, -30, 0], duration: 12, delay: 3 },
  { y: [0, -10, 0], x: [0, 25, 0], duration: 15, delay: 1.8 },
  { y: [0, -35, 0], x: [0, -15, 0], duration: 13, delay: 2.2 },
];

export const HeroSection: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader(); // Use the loader context

  const handleBookSlotClick = () => {
    // Show loader immediately for better user feedback
    showLoader("Preparing your charging experience...");
    
    // If user is logged in, redirect to find-bunks page
    // If not logged in, redirect to login page
    if (session?.user) {
      router.push("/find-bunks");
    } else {
      router.push("/login");
    }
    
    // Hide loader after a reasonable time to ensure smooth transition
    setTimeout(() => {
      hideLoader();
    }, 800);
  };

  const handleContactClick = () => {
    // Show loader immediately for better user feedback
    showLoader("Loading contact page...");
    
    // Redirect to contact page
    router.push("/contact");
    
    // Hide loader after a reasonable time to ensure smooth transition
    setTimeout(() => {
      hideLoader();
    }, 800);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#334155] pt-16">
      {/* Hero Banner Image - Full width and height */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/hero-banner.jpg"
          alt="EV Charging Station"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1E293B]/80 via-[#1E293B]/50 to-[#1E293B]/80"></div>
      </div>
      
      {/* Animated background elements on top of banner */}
      <div className="absolute inset-0 z-10">
        {/* Gradient blobs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] opacity-20 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] opacity-20 blur-3xl"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {particlePositions.map((pos, i) => {
            const animation = particleAnimations[i];
            if (!animation) return null;
            return (
              <motion.div
                key={i}
                className="absolute rounded-full bg-[#8B5CF6]/30"
                style={{
                  width: pos.width,
                  height: pos.height,
                  top: pos.top,
                  left: pos.left,
                }}
                animate={{
                  y: animation.y,
                  x: animation.x,
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: animation.duration,
                  repeat: Infinity,
                  delay: animation.delay,
                }}
              />
            );
          })}
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="absolute top-0 bottom-0 w-px bg-[#8B5CF6]" style={{ left: `${i * 10}%` }}></div>
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="absolute left-0 right-0 h-px bg-[#10B981]" style={{ top: `${i * 10}%` }}></div>
          ))}
        </div>
      </div>
      
      {/* Content centered on top of the banner */}
      <div className="container mx-auto relative z-20">
        <div className="flex flex-col items-center justify-center min-h-screen py-12 md:py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-responsive-xl font-bold text-[#F1F5F9] mb-4 sm:mb-6">
              Power the Future of <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#10B981] to-[#059669]">Electric Mobility</span>
            </h1>
            <p className="text-base sm:text-lg text-[#CBD5E1] mb-6 sm:mb-8 max-w-2xl mx-auto">
              India's most advanced EV charging network. Book your charging slot seamlessly and power up in minutes, not hours. 
              Join the green revolution across the nation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="md" 
                glow
                className="bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white hover:from-[#7C3AED] hover:to-[#059669] w-full sm:w-auto"
                onClick={handleBookSlotClick}
              >
                Book a Slot
              </Button>
              <Button 
                variant="outline" 
                size="md" 
                className="w-full sm:w-auto"
                onClick={handleContactClick}
              >
                Contact
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};