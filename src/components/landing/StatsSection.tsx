"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Section } from '@/components/ui/Section';

export const StatsSection: React.FC = () => {
  const stats = [
    { value: "50,000+", label: "EVs Charged" },
    { value: "300+", label: "Charging Bunks" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Support" },
  ];

  // Predefined positions and sizes for particles to ensure SSR/CSR consistency
  const particleData = [
    { width: 15, height: 15, top: "10%", left: "20%" },
    { width: 20, height: 20, top: "75%", left: "80%" },
    { width: 10, height: 10, top: "40%", left: "15%" },
    { width: 25, height: 25, top: "25%", left: "70%" },
    { width: 12, height: 12, top: "60%", left: "45%" },
    { width: 18, height: 18, top: "15%", left: "85%" },
    { width: 8, height: 8, top: "85%", left: "30%" },
    { width: 22, height: 22, top: "35%", left: "55%" },
    { width: 14, height: 14, top: "70%", left: "25%" },
    { width: 16, height: 16, top: "20%", left: "65%" },
    { width: 9, height: 9, top: "55%", left: "10%" },
    { width: 19, height: 19, top: "50%", left: "90%" },
    { width: 11, height: 11, top: "30%", left: "40%" },
    { width: 23, height: 23, top: "65%", left: "75%" },
    { width: 7, height: 7, top: "80%", left: "20%" },
    { width: 21, height: 21, top: "10%", left: "50%" },
    { width: 13, height: 13, top: "45%", left: "35%" },
    { width: 17, height: 17, top: "75%", left: "85%" },
    { width: 6, height: 6, top: "55%", left: "60%" },
    { width: 24, height: 24, top: "15%", left: "75%" },
  ];

  // Predefined animation values for particles
  const particleAnimations = [
    { y: [0, -30, 0], x: [0, 5, 0], duration: 7, delay: 0 },
    { y: [0, -30, 0], x: [0, -5, 0], duration: 8, delay: 1 },
    { y: [0, -30, 0], x: [0, 10, 0], duration: 6, delay: 0.5 },
    { y: [0, -30, 0], x: [0, -10, 0], duration: 9, delay: 2 },
    { y: [0, -30, 0], x: [0, 0, 0], duration: 5, delay: 1.5 },
    { y: [0, -30, 0], x: [0, 15, 0], duration: 10, delay: 0.8 },
    { y: [0, -30, 0], x: [0, -15, 0], duration: 7, delay: 2.5 },
    { y: [0, -30, 0], x: [0, 5, 0], duration: 8, delay: 1.2 },
    { y: [0, -30, 0], x: [0, -20, 0], duration: 6, delay: 0.3 },
    { y: [0, -30, 0], x: [0, 20, 0], duration: 9, delay: 3 },
    { y: [0, -30, 0], x: [0, -10, 0], duration: 7, delay: 1.8 },
    { y: [0, -30, 0], x: [0, 10, 0], duration: 8, delay: 2.2 },
    { y: [0, -30, 0], x: [0, 0, 0], duration: 5, delay: 0.7 },
    { y: [0, -30, 0], x: [0, -25, 0], duration: 10, delay: 1.3 },
    { y: [0, -30, 0], x: [0, 25, 0], duration: 6, delay: 2.8 },
    { y: [0, -30, 0], x: [0, -5, 0], duration: 7, delay: 0.9 },
    { y: [0, -30, 0], x: [0, 15, 0], duration: 8, delay: 1.7 },
    { y: [0, -30, 0], x: [0, -15, 0], duration: 9, delay: 2.1 },
    { y: [0, -30, 0], x: [0, 10, 0], duration: 6, delay: 0.4 },
    { y: [0, -30, 0], x: [0, -10, 0], duration: 7, delay: 3.2 },
  ];

  // Predefined positions for map nodes
  const nodePositions = [
    { top: "20%", left: "30%" },
    { top: "40%", left: "70%" },
    { top: "60%", left: "40%" },
    { top: "30%", left: "20%" },
    { top: "50%", left: "80%" },
    { top: "70%", left: "50%" },
    { top: "25%", left: "60%" },
    { top: "55%", left: "30%" },
    { top: "75%", left: "70%" },
    { top: "35%", left: "45%" },
    { top: "65%", left: "25%" },
    { top: "45%", left: "65%" },
  ];

  // Predefined animation values for map nodes
  const nodeAnimations = [
    { delay: 0 },
    { delay: 0.5 },
    { delay: 1 },
    { delay: 1.5 },
    { delay: 2 },
    { delay: 0.3 },
    { delay: 0.8 },
    { delay: 1.3 },
    { delay: 1.8 },
    { delay: 2.3 },
    { delay: 0.6 },
    { delay: 1.1 },
  ];

  return (
    <Section className="relative overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#334155]">
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
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: particleAnimations[i].duration,
              repeat: Infinity,
              delay: particleAnimations[i].delay,
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#10B981] to-[#059669] mb-2">
                {stat.value}
              </div>
              <div className="text-[#CBD5E1] font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
        
        {/* Futuristic map infographic */}
        <motion.div 
          className="mt-16 rounded-3xl bg-[#334155]/50 border border-[#475569]/50 backdrop-blur-sm p-8 relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="absolute inset-0 z-0">
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
          
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-center mb-8 text-[#F1F5F9]">Global Network Coverage</h3>
            
            {/* Map visualization */}
            <div className="relative h-64 rounded-2xl bg-[#1E293B]/50 border border-[#475569]/50">
              {/* Glowing nodes */}
              {nodePositions.map((pos, i) => (
                <motion.div
                  key={i}
                  className="absolute w-4 h-4 rounded-full bg-[#8B5CF6] border-2 border-[#F1F5F9]"
                  style={{
                    top: pos.top,
                    left: pos.left,
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: nodeAnimations[i].delay,
                  }}
                >
                  <div className="absolute inset-0 w-4 h-4 rounded-full bg-[#8B5CF6] animate-ping opacity-75"></div>
                </motion.div>
              ))}
              
              {/* User location */}
              <motion.div
                className="absolute w-6 h-6 rounded-full bg-[#10B981] border-2 border-[#F1F5F9]"
                style={{ top: "50%", left: "50%" }}
                animate={{
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
};