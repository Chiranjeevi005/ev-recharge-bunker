"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';

interface ApiLoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  overlay?: boolean;
  message?: string;
  className?: string;
}

export const ApiLoadingIndicator: React.FC<ApiLoadingIndicatorProps> = ({ 
  size = 'md', 
  overlay = false,
  message = 'Loading...',
  className = ''
}) => {
  // Size configurations
  const sizeConfig = {
    sm: { logo: 40, container: 'w-20 h-20', ring: 'w-20 h-20', text: 'text-sm' },
    md: { logo: 64, container: 'w-32 h-32', ring: 'w-32 h-32', text: 'text-base' },
    lg: { logo: 96, container: 'w-48 h-48', ring: 'w-48 h-48', text: 'text-lg' }
  };

  const config = sizeConfig[size];

  // Central logo pulse animation
  const logoVariants: Variants = {
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  // Energy ring animation
  const ringVariants: Variants = {
    rotate: {
      rotate: [0, 360],
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: "linear" as const
      }
    }
  };

  // Energy arc animation
  const arcVariants: Variants = {
    flow: (i: number) => ({
      pathLength: [0, 1, 0],
      opacity: [0, 1, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        delay: i * 0.5,
        ease: "easeInOut" as const
      }
    })
  };

  // Particle animation
  const particleVariants: Variants = {
    float: (i: number) => ({
      x: [0, Math.sin(i * 45) * 30, 0],
      y: [0, Math.cos(i * 45) * 30, 0],
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        delay: i * 0.2,
        ease: "easeInOut" as const
      }
    })
  };

  return (
    <div className={`${overlay ? 'fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/70 backdrop-blur-sm' : 'relative'} ${className}`}>
      <div className="flex flex-col items-center">
        {/* Central animation container */}
        <div className={`${config.container} relative flex items-center justify-center`}>
          {/* Outer energy ring */}
          <motion.div
            className={`${config.ring} absolute rounded-full border border-[#8B5CF6]/30`}
            variants={ringVariants}
            animate="rotate"
          />
          
          {/* Inner energy ring with different rotation */}
          <motion.div
            className={`${config.ring} absolute rounded-full border border-[#10B981]/30`}
            variants={ringVariants}
            animate="rotate"
            style={{ 
              rotate: 120,
              scale: 0.8
            }}
          />
          
          {/* Energy arcs */}
          {[...Array(8)].map((_, i) => (
            <motion.svg
              key={i}
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
            >
              <motion.path
                d={`M 50 10 A 40 40 0 0 1 ${50 + 40 * Math.cos((i * 45 - 90) * Math.PI / 180)} ${50 + 40 * Math.sin((i * 45 - 90) * Math.PI / 180)}`}
                fill="none"
                stroke={`url(#gradient-${i % 3})`}
                strokeWidth="1"
                strokeLinecap="round"
                custom={i}
                variants={arcVariants}
                animate="flow"
              />
            </motion.svg>
          ))}
          
          {/* Particle system */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-[#8B5CF6]"
              custom={i}
              variants={particleVariants}
              animate="float"
              style={{
                top: '50%',
                left: '50%',
                x: '-50%',
                y: '-50%',
              }}
            />
          ))}
          
          {/* Central logo with glow effect */}
          <motion.div
            className="relative z-10"
            variants={logoVariants}
            animate="pulse"
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-full blur-xl"
              style={{
                background: "radial-gradient(circle, rgba(139, 92, 246, 0.6), rgba(16, 185, 129, 0.6), rgba(124, 58, 237, 0.6))"
              }}
              animate={{
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.3, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut" as const
              }}
            />
            
            {/* Logo */}
            <div className="relative">
              <Image 
                src="/assets/logo.png" 
                alt="EV Bunker Logo" 
                width={config.logo} 
                height={config.logo} 
                className="object-contain"
              />
            </div>
          </motion.div>
        </div>
        
        {/* Gradient definitions for energy arcs */}
        <svg className="absolute w-0 h-0">
          <defs>
            <linearGradient id="gradient-0" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0)" />
              <stop offset="50%" stopColor="rgba(139, 92, 246, 1)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
            </linearGradient>
            <linearGradient id="gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0)" />
              <stop offset="50%" stopColor="rgba(16, 185, 129, 1)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
            </linearGradient>
            <linearGradient id="gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(124, 58, 237, 0)" />
              <stop offset="50%" stopColor="rgba(124, 58, 237, 1)" />
              <stop offset="100%" stopColor="rgba(124, 58, 237, 0)" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Loading message */}
        {message && (
          <motion.div 
            className={`mt-6 text-[#F1F5F9] ${config.text} font-medium`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {message}
          </motion.div>
        )}
      </div>
    </div>
  );
};