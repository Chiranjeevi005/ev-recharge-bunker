"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Section } from '@/components/landing/Section';

export const StatsSection: React.FC = () => {
  // Professional placeholder data for statistics
  const stats = [
    { value: "100+", label: "Charging Stations" },
    { value: "5000+", label: "EVs Served" },
    { value: "99.9%", label: "Network Uptime" },
    { value: "24/7", label: "Support" },
  ];

  // Predefined positions and sizes for particles to ensure SSR/CSR consistency
  const particleData = [
    { width: 8, height: 8, top: "10%", left: "20%" },
    { width: 12, height: 12, top: "75%", left: "80%" },
    { width: 6, height: 6, top: "40%", left: "15%" },
    { width: 15, height: 15, top: "25%", left: "70%" },
    { width: 7, height: 7, top: "60%", left: "45%" },
    { width: 10, height: 10, top: "15%", left: "85%" },
    { width: 5, height: 5, top: "85%", left: "30%" },
    { width: 13, height: 13, top: "35%", left: "55%" },
    { width: 8, height: 8, top: "70%", left: "25%" },
    { width: 10, height: 10, top: "20%", left: "65%" },
    { width: 5, height: 5, top: "55%", left: "10%" },
    { width: 11, height: 11, top: "50%", left: "90%" },
  ];

  // Predefined animation values for particles
  const particleAnimations = [
    { y: [0, -20, 0], x: [0, 3, 0], duration: 5, delay: 0 },
    { y: [0, -20, 0], x: [0, -3, 0], duration: 6, delay: 0.7 },
    { y: [0, -20, 0], x: [0, 6, 0], duration: 4, delay: 0.3 },
    { y: [0, -20, 0], x: [0, -6, 0], duration: 7, delay: 1.2 },
    { y: [0, -20, 0], x: [0, 0, 0], duration: 3, delay: 0.9 },
    { y: [0, -20, 0], x: [0, 9, 0], duration: 8, delay: 0.5 },
    { y: [0, -20, 0], x: [0, -9, 0], duration: 5, delay: 1.5 },
    { y: [0, -20, 0], x: [0, 3, 0], duration: 6, delay: 0.8 },
    { y: [0, -20, 0], x: [0, -12, 0], duration: 4, delay: 0.2 },
    { y: [0, -20, 0], x: [0, 12, 0], duration: 7, delay: 1.8 },
    { y: [0, -20, 0], x: [0, -6, 0], duration: 5, delay: 1.1 },
    { y: [0, -20, 0], x: [0, 6, 0], duration: 6, delay: 1.3 },
  ];

  return (
    <Section className="relative overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#334155] py-12 sm:py-16">
      {/* Animated background particles */}
      <div className="absolute inset-0 z-0">
        {particleData.map((data, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#8B5CF6]/20"
            style={{
              width: data.width,
              height: data.height,
              top: data.top,
              left: data.left,
            }}
            animate={{
              y: particleAnimations[i].y,
              x: particleAnimations[i].x,
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: particleAnimations[i].duration,
              repeat: Infinity,
              delay: particleAnimations[i].delay,
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#10B981] to-[#059669] mb-1 sm:mb-2">
                {stat.value}
              </div>
              <div className="text-[#CBD5E1] font-medium text-sm sm:text-base">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
};