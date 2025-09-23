"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Predefined particle positions and properties to avoid hydration issues
const particlePositions = [
  { width: 5, height: 5, top: "10%", left: "20%", color: "rgba(139, 92, 246, 0.8)" },
  { width: 3, height: 3, top: "15%", left: "70%", color: "rgba(16, 185, 129, 0.8)" },
  { width: 6, height: 6, top: "25%", left: "40%", color: "rgba(5, 150, 105, 0.8)" },
  { width: 4, height: 4, top: "35%", left: "85%", color: "rgba(139, 92, 246, 0.8)" },
  { width: 7, height: 7, top: "45%", left: "15%", color: "rgba(16, 185, 129, 0.8)" },
  { width: 3, height: 3, top: "55%", left: "60%", color: "rgba(5, 150, 105, 0.8)" },
  { width: 5, height: 5, top: "65%", left: "30%", color: "rgba(139, 92, 246, 0.8)" },
  { width: 4, height: 4, top: "75%", left: "80%", color: "rgba(16, 185, 129, 0.8)" },
  { width: 6, height: 6, top: "85%", left: "50%", color: "rgba(5, 150, 105, 0.8)" },
  { width: 3, height: 3, top: "20%", left: "10%", color: "rgba(139, 92, 246, 0.8)" },
  { width: 5, height: 5, top: "30%", left: "75%", color: "rgba(16, 185, 129, 0.8)" },
  { width: 4, height: 4, top: "40%", left: "25%", color: "rgba(5, 150, 105, 0.8)" },
  { width: 6, height: 6, top: "50%", left: "90%", color: "rgba(139, 92, 246, 0.8)" },
  { width: 3, height: 3, top: "60%", left: "35%", color: "rgba(16, 185, 129, 0.8)" },
  { width: 5, height: 5, top: "70%", left: "65%", color: "rgba(5, 150, 105, 0.8)" },
  { width: 4, height: 4, top: "80%", left: "15%", color: "rgba(139, 92, 246, 0.8)" },
  { width: 6, height: 6, top: "90%", left: "55%", color: "rgba(16, 185, 129, 0.8)" },
  { width: 3, height: 3, top: "12%", left: "45%", color: "rgba(5, 150, 105, 0.8)" },
  { width: 5, height: 5, top: "22%", left: "85%", color: "rgba(139, 92, 246, 0.8)" },
  { width: 4, height: 4, top: "32%", left: "20%", color: "rgba(16, 185, 129, 0.8)" },
  { width: 6, height: 6, top: "42%", left: "70%", color: "rgba(5, 150, 105, 0.8)" },
  { width: 3, height: 3, top: "52%", left: "10%", color: "rgba(139, 92, 246, 0.8)" },
  { width: 5, height: 5, top: "62%", left: "60%", color: "rgba(16, 185, 129, 0.8)" },
  { width: 4, height: 4, top: "72%", left: "25%", color: "rgba(5, 150, 105, 0.8)" },
  { width: 6, height: 6, top: "82%", left: "80%", color: "rgba(139, 92, 246, 0.8)" },
  { width: 3, height: 3, top: "92%", left: "40%", color: "rgba(16, 185, 129, 0.8)" },
  { width: 5, height: 5, top: "18%", left: "75%", color: "rgba(5, 150, 105, 0.8)" },
  { width: 4, height: 4, top: "28%", left: "30%", color: "rgba(139, 92, 246, 0.8)" },
  { width: 6, height: 6, top: "38%", left: "85%", color: "rgba(16, 185, 129, 0.8)" },
  { width: 3, height: 3, top: "48%", left: "15%", color: "rgba(5, 150, 105, 0.8)" },
  { width: 5, height: 5, top: "58%", left: "70%", color: "rgba(139, 92, 246, 0.8)" },
  { width: 4, height: 4, top: "68%", left: "20%", color: "rgba(16, 185, 129, 0.8)" },
  { width: 6, height: 6, top: "78%", left: "75%", color: "rgba(5, 150, 105, 0.8)" },
  { width: 3, height: 3, top: "88%", left: "30%", color: "rgba(139, 92, 246, 0.8)" },
  { width: 5, height: 5, top: "8%", left: "65%", color: "rgba(16, 185, 129, 0.8)" },
  { width: 4, height: 4, top: "18%", left: "10%", color: "rgba(5, 150, 105, 0.8)" },
  { width: 6, height: 6, top: "28%", left: "60%", color: "rgba(139, 92, 246, 0.8)" },
  { width: 3, height: 3, top: "38%", left: "5%", color: "rgba(16, 185, 129, 0.8)" },
  { width: 5, height: 5, top: "48%", left: "55%", color: "rgba(5, 150, 105, 0.8)" },
  { width: 4, height: 4, top: "58%", left: "95%", color: "rgba(139, 92, 246, 0.8)" },
];

// Predefined energy line positions
const energyLinePositions = [
  { angle: 0, color: "linear-gradient(90deg, rgba(139, 92, 246, 0.8), transparent)" },
  { angle: 22.5, color: "linear-gradient(90deg, rgba(16, 185, 129, 0.8), transparent)" },
  { angle: 45, color: "linear-gradient(90deg, rgba(5, 150, 105, 0.8), transparent)" },
  { angle: 67.5, color: "linear-gradient(90deg, rgba(139, 92, 246, 0.8), transparent)" },
  { angle: 90, color: "linear-gradient(90deg, rgba(16, 185, 129, 0.8), transparent)" },
  { angle: 112.5, color: "linear-gradient(90deg, rgba(5, 150, 105, 0.8), transparent)" },
  { angle: 135, color: "linear-gradient(90deg, rgba(139, 92, 246, 0.8), transparent)" },
  { angle: 157.5, color: "linear-gradient(90deg, rgba(16, 185, 129, 0.8), transparent)" },
  { angle: 180, color: "linear-gradient(90deg, rgba(5, 150, 105, 0.8), transparent)" },
  { angle: 202.5, color: "linear-gradient(90deg, rgba(139, 92, 246, 0.8), transparent)" },
  { angle: 225, color: "linear-gradient(90deg, rgba(16, 185, 129, 0.8), transparent)" },
  { angle: 247.5, color: "linear-gradient(90deg, rgba(5, 150, 105, 0.8), transparent)" },
  { angle: 270, color: "linear-gradient(90deg, rgba(139, 92, 246, 0.8), transparent)" },
  { angle: 292.5, color: "linear-gradient(90deg, rgba(16, 185, 129, 0.8), transparent)" },
  { angle: 315, color: "linear-gradient(90deg, rgba(5, 150, 105, 0.8), transparent)" },
  { angle: 337.5, color: "linear-gradient(90deg, rgba(139, 92, 246, 0.8), transparent)" },
];

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#334155]">
      {/* Animated background elements matching website theme */}
      <div className="absolute inset-0 z-0">
        {/* Gradient shift animation */}
        <motion.div 
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 50% 20%, rgba(5, 150, 105, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)"
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        {/* Tech grid pattern matching website theme */}
        <div className="absolute inset-0 opacity-10">
          {/* Horizontal lines */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-0 bottom-0 w-px bg-[#8B5CF6]"
              style={{ left: `${i * 5}%` }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
          
          {/* Vertical lines */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute left-0 right-0 h-px bg-[#10B981]"
              style={{ top: `${i * 5}%` }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Particle system with predefined positions to avoid hydration issues */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {particlePositions.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: particle.width,
              height: particle.height,
              top: particle.top,
              left: particle.left,
              background: particle.color
            }}
            animate={{
              x: [0, (i % 2 === 0 ? 50 : -50)],
              y: [0, (i % 3 === 0 ? 50 : -50)],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
      
      {/* Energy flow lines from logo matching theme */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
        {energyLinePositions.map((line, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-0.5 origin-left"
            style={{
              transform: `rotate(${line.angle}deg)`,
              background: line.color
            }}
            animate={{
              scaleX: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
      
      {/* Central content - Logo only, no container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo with glow and pulse effect */}
        <motion.div
          className="relative"
          animate={{
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Glow effect behind logo */}
          <motion.div
            className="absolute inset-0 rounded-full blur-2xl"
            style={{
              background: "radial-gradient(circle, rgba(139, 92, 246, 0.8), rgba(16, 185, 129, 0.8))"
            }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          />
          
          {/* Reflection/highlight effect */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-1/3 h-1/3 rounded-full bg-white opacity-20 blur-sm"
            animate={{
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
          
          {/* Logo - no container, transparent background */}
          <div className="relative">
            <Image 
              src="/assets/logo.png" 
              alt="EV Bunker Logo" 
              width={160} 
              height={160} 
              className="object-contain"
            />
          </div>
        </motion.div>
        
        {/* Futuristic loading text with tech font */}
        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.h2 
            className="text-2xl font-light tracking-wider text-[#F1F5F9] font-mono"
            animate={{
              textShadow: [
                "0 0 10px rgba(139, 92, 246, 0.7), 0 0 20px rgba(16, 185, 129, 0.5)",
                "0 0 15px rgba(139, 92, 246, 0.9), 0 0 30px rgba(16, 185, 129, 0.7)",
                "0 0 10px rgba(139, 92, 246, 0.7), 0 0 20px rgba(16, 185, 129, 0.5)"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          >
            EV Revolution Loading...
          </motion.h2>
        </motion.div>
        
        {/* Battery loading animation */}
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <div className="relative w-64 h-8 bg-[#334155] border-2 border-[#475569] rounded-lg overflow-hidden">
            {/* Battery terminal */}
            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-3 h-4 bg-[#475569] rounded-r-sm"></div>
            
            {/* Battery fill with gradient and animation */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6] via-[#10B981] to-[#059669] rounded-sm"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ 
                duration: 3, 
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            
            {/* Animated charging effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 h-4 bg-white mx-1 rounded-full"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scaleY: [0.5, 1.2, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};