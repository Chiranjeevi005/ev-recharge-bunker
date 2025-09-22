"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

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
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#334155]">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        {/* Gradient blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] opacity-20 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] opacity-20 blur-3xl"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {particlePositions.map((pos, i) => (
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
                y: particleAnimations[i].y,
                x: particleAnimations[i].x,
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: particleAnimations[i].duration,
                repeat: Infinity,
                delay: particleAnimations[i].delay,
              }}
            />
          ))}
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute top-0 bottom-0 w-px bg-[#8B5CF6]" style={{ left: `${i * 5}%` }}></div>
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute left-0 right-0 h-px bg-[#10B981]" style={{ top: `${i * 5}%` }}></div>
          ))}
        </div>
      </div>
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-[#F1F5F9] mb-6">
              Power the Future of <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#10B981] to-[#059669]">Electric Mobility</span>
            </h1>
            <p className="text-lg md:text-xl text-[#CBD5E1] mb-8 max-w-2xl">
              India's most advanced EV charging network. Book your charging slot seamlessly and power up in minutes, not hours. 
              Join the green revolution across the nation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" glow>
                Find a Bunk
              </Button>
              <Button variant="outline" size="lg">
                How It Works
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Futuristic EV illustration */}
            <div className="relative rounded-3xl bg-gradient-to-br from-[#334155]/50 to-[#1E293B]/50 border border-[#475569]/50 backdrop-blur-sm p-8">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#8B5CF6] via-[#10B981] to-[#059669] opacity-20 blur-xl"></div>
              <div className="relative z-10">
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    {/* EV Car */}
                    <div className="w-64 h-32 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-t-2xl rounded-b-lg"></div>
                    <div className="absolute -bottom-4 left-8 w-8 h-8 rounded-full bg-[#475569]"></div>
                    <div className="absolute -bottom-4 right-8 w-8 h-8 rounded-full bg-[#475569]"></div>
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-gradient-to-r from-[#8B5CF6] to-[#10B981] rounded-t-lg"></div>
                    
                    {/* Charging effect */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                      <div className="w-1 h-8 bg-[#059669] animate-pulse"></div>
                      <div className="w-4 h-4 rounded-full bg-[#059669] animate-ping absolute -top-2 -left-1.5"></div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-[#F1F5F9] mb-2">Ultra-Fast Charging</h3>
                  <p className="text-[#CBD5E1]">80% charge in just 15 minutes</p>
                </div>
              </div>
              
              {/* Charging stats */}
              <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] flex items-center justify-center text-[#1E293B]">
                <div className="text-center">
                  <div className="font-bold">15</div>
                  <div className="text-xs">min</div>
                </div>
              </div>
              
              <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] flex items-center justify-center text-[#F1F5F9]">
                <div className="text-center">
                  <div className="font-bold">80%</div>
                  <div className="text-xs">charge</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};