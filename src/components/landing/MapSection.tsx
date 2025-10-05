"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Section } from '@/components/landing/Section';

export const MapSection: React.FC = () => {
  const [selectedStation, setSelectedStation] = useState<number | null>(null);
  
  // Professional placeholder data with real locations in India
  const stations = [
    { id: 1, name: "Delhi Metro", location: "New Delhi", status: "Available", x: "25%", y: "35%" },
    { id: 2, name: "Mumbai Central", location: "Mumbai", status: "Busy", x: "15%", y: "55%" },
    { id: 3, name: "Bangalore Tech Park", location: "Bangalore", status: "Available", x: "30%", y: "65%" },
    { id: 4, name: "Chennai Airport", location: "Chennai", status: "Available", x: "35%", y: "75%" },
    { id: 5, name: "Kolkata Station", location: "Kolkata", status: "Maintenance", x: "45%", y: "45%" },
  ];

  return (
    <Section id="stations" className="bg-[#1E293B] section-responsive">
      <div className="container mx-auto">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-responsive-2xl font-bold text-[#F1F5F9] mb-3 sm:mb-4">
            Network Coverage
          </h2>
          <p className="text-base sm:text-lg text-[#CBD5E1] max-w-2xl mx-auto px-4">
            Explore our growing network of charging stations across major Indian cities.
          </p>
        </motion.div>

        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#475569] shadow-xl shadow-[#8B5CF6]/10">
          {/* Map background */}
          <div className="relative h-80 sm:h-96 md:h-[500px] bg-gradient-to-br from-[#334155] to-[#1E293B]">
            {/* Grid lines */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="absolute top-0 bottom-0 w-px bg-[#8B5CF6]/20" style={{ left: `${i * 10}%` }}></div>
              ))}
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="absolute left-0 right-0 h-px bg-[#10B981]/20" style={{ top: `${i * 10}%` }}></div>
              ))}
            </div>
            
            {/* Connection lines */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/5 w-3/5 h-px bg-[#8B5CF6]/30"></div>
              <div className="absolute top-1/2 left-1/4 w-1/2 h-px bg-[#10B981]/30"></div>
            </div>
            
            {/* Charging stations */}
            {stations.map((station) => (
              <motion.div
                key={station.id}
                className={`absolute w-5 h-5 sm:w-6 sm:h-6 rounded-full ${
                  station.status === "Available" 
                    ? "bg-[#10B981] border-2 border-[#F1F5F9]" 
                    : station.status === "Busy" 
                      ? "bg-[#F59E0B] border-2 border-[#F1F5F9]" 
                      : "bg-[#94A3B8] border-2 border-[#F1F5F9]"
                } flex items-center justify-center cursor-pointer`}
                style={{ left: station.x, top: station.y }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedStation(station.id)}
              >
                <div className={`absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
                  station.status === "Available" 
                    ? "bg-[#10B981]" 
                    : station.status === "Busy" 
                      ? "bg-[#F59E0B]" 
                      : "bg-[#94A3B8]"
                } animate-ping opacity-75`}></div>
              </motion.div>
            ))}
            
            {/* User location */}
            <motion.div
              className="absolute w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#10B981] border-2 border-[#F1F5F9] flex items-center justify-center"
              style={{ left: "50%", top: "50%" }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#F1F5F9]"></div>
            </motion.div>
          </div>
          
          {/* Legend */}
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 flex space-x-3 sm:space-x-4">
            <div className="flex items-center">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#10B981] mr-2"></div>
              <span className="text-xs text-[#CBD5E1]">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#F59E0B] mr-2"></div>
              <span className="text-xs text-[#CBD5E1]">Busy</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#94A3B8] mr-2"></div>
              <span className="text-xs text-[#CBD5E1]">Maintenance</span>
            </div>
          </div>
        </div>
        
        {/* Station details */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {stations.map((station) => (
            <motion.div
              key={station.id}
              className={`flex items-center p-3 sm:p-4 rounded-xl ${
                selectedStation === station.id 
                  ? "bg-[#334155] border border-[#8B5CF6]/50" 
                  : "bg-[#334155] border border-[#475569]/50"
              } hover:border-[#8B5CF6]/50 transition-all duration-300`}
              whileHover={{ y: -3 }}
              onClick={() => setSelectedStation(station.id)}
            >
              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-2 sm:mr-3 ${
                station.status === "Available" 
                  ? "bg-[#10B981]" 
                  : station.status === "Busy" 
                    ? "bg-[#F59E0B]" 
                    : "bg-[#94A3B8]"
              }`}></div>
              <div>
                <div className="font-medium text-[#F1F5F9] text-sm sm:text-base">{station.name}</div>
                <div className="text-xs text-[#E2E8F0]">{station.location}</div>
                <div className="text-xs text-[#CBD5E1]">{station.status}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
};