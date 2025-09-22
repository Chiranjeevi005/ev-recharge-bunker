"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Section } from '@/components/ui/Section';

export const MapSection: React.FC = () => {
  const [selectedStation, setSelectedStation] = useState<number | null>(null);
  
  const stations = [
    { id: 1, name: "Mumbai Hub", status: "Available", x: "20%", y: "30%" },
    { id: 2, name: "Delhi Station", status: "Busy", x: "70%", y: "40%" },
    { id: 3, name: "Bangalore Point", status: "Available", x: "40%", y: "60%" },
    { id: 4, name: "Chennai Express", status: "Available", x: "80%", y: "20%" },
    { id: 5, name: "Hyderabad Central", status: "Maintenance", x: "30%", y: "70%" },
  ];

  return (
    <Section id="map" className="bg-[#1E293B]">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#F1F5F9] mb-4">
            Network Coverage
          </h2>
          <p className="text-lg text-[#CBD5E1] max-w-2xl mx-auto">
            Explore our growing network of charging stations across the city.
          </p>
        </motion.div>

        <div className="relative rounded-3xl overflow-hidden border border-[#475569] shadow-2xl shadow-[#8B5CF6]/10">
          {/* Map background */}
          <div className="relative h-96 md:h-[500px] bg-gradient-to-br from-[#334155] to-[#1E293B]">
            {/* Grid lines */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="absolute top-0 bottom-0 w-px bg-[#8B5CF6]/20" style={{ left: `${i * 5}%` }}></div>
              ))}
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="absolute left-0 right-0 h-px bg-[#10B981]/20" style={{ top: `${i * 5}%` }}></div>
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
                className={`absolute w-6 h-6 rounded-full ${
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
                <div className={`absolute w-4 h-4 rounded-full ${
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
              className="absolute w-8 h-8 rounded-full bg-[#10B981] border-2 border-[#F1F5F9] flex items-center justify-center"
              style={{ left: "50%", top: "50%" }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="w-3 h-3 rounded-full bg-[#F1F5F9]"></div>
            </motion.div>
          </div>
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#10B981] mr-2"></div>
              <span className="text-xs text-[#CBD5E1]">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#F59E0B] mr-2"></div>
              <span className="text-xs text-[#CBD5E1]">Busy</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#94A3B8] mr-2"></div>
              <span className="text-xs text-[#CBD5E1]">Maintenance</span>
            </div>
          </div>
        </div>
        
        {/* Station details */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stations.map((station) => (
            <motion.div
              key={station.id}
              className={`flex items-center p-3 rounded-xl ${
                selectedStation === station.id 
                  ? "bg-[#334155] border border-[#8B5CF6]/50" 
                  : "bg-[#334155] border border-[#475569]/50"
              } hover:border-[#8B5CF6]/50 transition-all duration-300`}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedStation(station.id)}
            >
              <div className={`w-3 h-3 rounded-full mr-3 ${
                station.status === "Available" 
                  ? "bg-[#10B981]" 
                  : station.status === "Busy" 
                    ? "bg-[#F59E0B]" 
                    : "bg-[#94A3B8]"
              }`}></div>
              <div>
                <div className="font-medium text-[#F1F5F9]">{station.name}</div>
                <div className="text-xs text-[#E2E8F0]">{station.status}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
};