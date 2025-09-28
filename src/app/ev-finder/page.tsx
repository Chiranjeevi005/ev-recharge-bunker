"use client";

import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { BunkFinderMap } from '@/components/landing/BunkFinderMap';
import { Footer } from '@/components/landing/Footer';

export default function EVFinder() {
  return (
    <div className="min-h-screen bg-[#1E293B]">
      <Navbar />
      
      <main className="pt-16 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-[#F1F5F9] mb-2">EV Charging Station Finder</h1>
          <p className="text-[#94A3B8] mb-8">Find and book EV charging stations near you with our futuristic map interface</p>
          
          <div className="rounded-2xl overflow-hidden border border-[#475569] shadow-xl shadow-[#8B5CF6]/10">
            <BunkFinderMap />
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#334155] p-6 rounded-xl border border-[#475569]">
              <h2 className="text-xl font-bold text-[#F1F5F9] mb-3">Features</h2>
              <ul className="space-y-2 text-[#CBD5E1]">
                <li className="flex items-center">
                  <span className="text-[#10B981] mr-2">✓</span>
                  Real-time charging station availability
                </li>
                <li className="flex items-center">
                  <span className="text-[#10B981] mr-2">✓</span>
                  Interactive booking system
                </li>
                <li className="flex items-center">
                  <span className="text-[#10B981] mr-2">✓</span>
                  Advanced filtering options
                </li>
                <li className="flex items-center">
                  <span className="text-[#10B981] mr-2">✓</span>
                  Multiple map themes
                </li>
              </ul>
            </div>
            
            <div className="bg-[#334155] p-6 rounded-xl border border-[#475569]">
              <h2 className="text-xl font-bold text-[#F1F5F9] mb-3">Technology</h2>
              <ul className="space-y-2 text-[#CBD5E1]">
                <li className="flex items-center">
                  <span className="text-[#8B5CF6] mr-2">⚡</span>
                  MapLibre GL JS
                </li>
                <li className="flex items-center">
                  <span className="text-[#8B5CF6] mr-2">⚡</span>
                  OpenStreetMap data
                </li>
                <li className="flex items-center">
                  <span className="text-[#8B5CF6] mr-2">⚡</span>
                  Framer Motion animations
                </li>
                <li className="flex items-center">
                  <span className="text-[#8B5CF6] mr-2">⚡</span>
                  Razorpay payments
                </li>
              </ul>
            </div>
            
            <div className="bg-[#334155] p-6 rounded-xl border border-[#475569]">
              <h2 className="text-xl font-bold text-[#F1F5F9] mb-3">Design</h2>
              <ul className="space-y-2 text-[#CBD5E1]">
                <li className="flex items-center">
                  <span className="text-[#F59E0B] mr-2">★</span>
                  Futuristic semi-dark theme
                </li>
                <li className="flex items-center">
                  <span className="text-[#F59E0B] mr-2">★</span>
                  Neon accents and glow effects
                </li>
                <li className="flex items-center">
                  <span className="text-[#F59E0B] mr-2">★</span>
                  Animated markers and controls
                </li>
                <li className="flex items-center">
                  <span className="text-[#F59E0B] mr-2">★</span>
                  Responsive mobile design
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}