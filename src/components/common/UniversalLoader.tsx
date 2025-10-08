"use client";

import React, { useEffect, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface UniversalLoaderProps {
  task?: string;
  state?: 'loading' | 'success' | 'error' | 'idle';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UniversalLoader: React.FC<UniversalLoaderProps> = ({ 
  task = "Loading...", 
  state = 'loading',
  size = 'md',
  className = '' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const energyRefs = useRef<HTMLDivElement[]>([]);
  
  const sizeClasses = {
    sm: { width: 30, height: 30 },
    md: { width: 40, height: 40 },
    lg: { width: 50, height: 50 },
    xl: { width: 60, height: 60 }
  };
  
  // State-based glow colors
  const stateGlowColors = {
    loading: "rgba(139, 92, 246, 0.4), rgba(16, 185, 129, 0.2), transparent",
    success: "rgba(16, 185, 129, 0.4), rgba(5, 150, 105, 0.2), transparent",
    error: "rgba(239, 68, 68, 0.4), rgba(245, 158, 11, 0.2), transparent",
    idle: "rgba(139, 92, 246, 0.3), rgba(16, 185, 129, 0.15), transparent"
  };
  
  const currentSize = sizeClasses[size];
  const energyCount = 12;
  
  // Predefined positions for energy particles to ensure SSR/CSR consistency
  const energyPositions: { left: number; background: number }[] = [
    { left: 45, background: 0 }, // white
    { left: 69, background: 1 }, // green
    { left: 35, background: 2 }, // purple
    { left: 57, background: 0 }, // white
    { left: 48, background: 1 }, // green
    { left: 34, background: 2 }, // purple
    { left: 46, background: 0 }, // white
    { left: 35, background: 1 }, // green
    { left: 66, background: 2 }, // purple
    { left: 55, background: 0 }, // white
    { left: 46, background: 1 }, // green
    { left: 33, background: 2 }  // purple
  ];
  
  // Predefined positions for spark particles to ensure SSR/CSR consistency
  const sparkPositions = [
    { x: -10, y: -15 },
    { x: 20, y: -25 },
    { x: -30, y: 10 },
    { x: 15, y: 30 },
    { x: -25, y: -10 },
    { x: 10, y: 20 },
    { x: -15, y: 25 },
    { x: 25, y: -20 }
  ];

  // Initialize focused GSAP animations
  useLayoutEffect(() => {
    if (!containerRef.current || !logoRef.current) return;
    
    const logo = logoRef.current;
    const energies = energyRefs.current.filter(Boolean);
    
    // Clear any existing animations
    gsap.killTweensOf([logo, textRef.current]);
    energies.forEach(energy => gsap.killTweensOf(energy));
    
    // Logo subtle animation - only gentle pulsing
    if (logo) {
      gsap.to(logo, {
        scale: 1.05,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }
    
    // Retained bottom effects - energy flow particles
    energies.forEach((energy, i) => {
      if (energy) {
        const tl = gsap.timeline({
          repeat: -1,
          delay: i * 0.2
        });
        
        tl.fromTo(energy,
          { 
            opacity: 0,
            y: 15
          },
          {
            opacity: 0.8,
            y: -15,
            duration: 1,
            ease: "power1.out"
          }
        ).to(energy, {
          opacity: 0,
          y: -30,
          duration: 0.5,
          ease: "power1.in"
        });
      }
    });
    
    // Enhanced futuristic text animations with additional effects
    if (textRef.current) {
      // Text fade in with digital effect
      gsap.fromTo(textRef.current,
        { opacity: 0, y: 15, letterSpacing: "0px" },
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }
      );
      
      // Futuristic glow and pulse effect
      const textTl = gsap.timeline({
        repeat: -1,
        yoyo: true
      });
      
      textTl.to(textRef.current, {
        textShadow: state === 'success' 
          ? "0 0 8px rgba(16, 185, 129, 0.8), 0 0 15px rgba(5, 150, 105, 0.6), 0 0 25px rgba(16, 185, 129, 0.4)"
          : state === 'error'
          ? "0 0 8px rgba(239, 68, 68, 0.8), 0 0 15px rgba(245, 158, 11, 0.6), 0 0 25px rgba(239, 68, 68, 0.4)"
          : "0 0 8px rgba(139, 92, 246, 0.8), 0 0 15px rgba(16, 185, 129, 0.6), 0 0 25px rgba(5, 150, 105, 0.4)",
        duration: 1,
        ease: "sine.inOut"
      }).to(textRef.current, {
        textShadow: state === 'success'
          ? "0 0 4px rgba(16, 185, 129, 0.5), 0 0 8px rgba(5, 150, 105, 0.3), 0 0 15px rgba(16, 185, 129, 0.2)"
          : state === 'error'
          ? "0 0 4px rgba(239, 68, 68, 0.5), 0 0 8px rgba(245, 158, 11, 0.3), 0 0 15px rgba(239, 68, 68, 0.2)"
          : "0 0 4px rgba(139, 92, 246, 0.5), 0 0 8px rgba(16, 185, 129, 0.3), 0 0 15px rgba(5, 150, 105, 0.2)",
        duration: 1,
        ease: "sine.inOut"
      });
      
      // Subtle futuristic tracking expansion
      gsap.to(textRef.current, {
        letterSpacing: "1.5px",
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }
    
    // Cleanup function
    return () => {
      gsap.killTweensOf([logo, textRef.current]);
      energies.forEach(energy => gsap.killTweensOf(energy));
    };
  }, [task, state]);

  // Update text when task prop changes with enhanced futuristic transition
  useEffect(() => {
    if (textRef.current) {
      const tl = gsap.timeline();
      
      // Enhanced digital glitch effect when text changes
      tl.to(textRef.current, {
        opacity: 0,
        y: -10,
        textShadow: "0 0 2px rgba(255, 255, 255, 0.8), 0 0 5px rgba(139, 92, 246, 0.8)",
        duration: 0.1,
        onComplete: () => {
          if (textRef.current) {
            gsap.to(textRef.current, {
              opacity: 1,
              y: 0,
              textShadow: "0 0 8px rgba(139, 92, 246, 0.8), 0 0 15px rgba(16, 185, 129, 0.6)",
              duration: 0.3,
              ease: "power2.out"
            });
          }
        }
      });
    }
  }, [task]);

  return (
    <motion.div 
      ref={containerRef}
      className={`flex flex-col items-center justify-center ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {/* Logo with focused animations */}
      <div className="relative flex items-center justify-center">
        {/* Central glow effect - perfectly centered on logo */}
        <motion.div
          className="absolute inset-0 rounded-full blur-lg"
          style={{
            background: `radial-gradient(circle, ${stateGlowColors[state]})`,
            width: currentSize.width * 1.4,
            height: currentSize.height * 1.4,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            opacity: state === 'success' ? [0.4, 0.8, 0.4] : state === 'error' ? [0.3, 0.7, 0.3] : [0.2, 0.5, 0.2],
            scale: [1, 1.05, 1],
          }}
          transition={{
            opacity: {
              duration: state === 'success' ? 1.5 : state === 'error' ? 1.8 : 2,
              repeat: Infinity,
            },
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        />
        
        {/* Framer Motion animation for spark effects - only small particles */}
        <div className="absolute inset-0 flex items-center justify-center">
          {Array.from({ length: 8 }).map((_, i) => {
            const position = sparkPositions[i] || { x: 0, y: 0 };
            return (
              <motion.div
                key={`spark-${i}`}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: 'rgba(255, 255, 200, 0.9)',
                  left: '50%',
                  top: '50%',
                  boxShadow: "0 0 4px rgba(255, 255, 200, 0.8)",
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  x: [0, position.x],
                  y: [0, position.y],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeOut"
                }}
              />
            );
          })}
        </div>
        
        {/* Retained bottom effects - energy flow particles */}
        {Array.from({ length: energyCount }).map((_, i) => {
          // Ensure we have a valid position (energyPositions has 12 items, same as energyCount)
          const position = energyPositions[i] || { left: 50, background: 0 }; // Default position as fallback
          return (
            <motion.div
              key={`energy-${i}`}
              ref={(el) => { if (el) energyRefs.current[i] = el; }}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: position.background === 0 
                  ? 'rgba(255, 255, 255, 0.9)' 
                  : position.background === 1 
                    ? 'rgba(16, 185, 129, 0.9)' 
                    : 'rgba(139, 92, 246, 0.9)',
                left: `${position.left}%`,
                top: '100%',
                boxShadow: "0 0 4px currentColor",
              }}
              animate={{
                y: [0, -30, -60],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeOut"
              }}
            />
          );
        })}
        
        {/* Logo image - stable with subtle pulse */}
        <motion.div 
          ref={logoRef}
          className="relative z-10"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Image 
            src="/assets/logo.png" 
            alt="EV Bunker Logo" 
            width={currentSize.width}
            height={currentSize.height}
            className="object-contain"
            priority
          />
        </motion.div>
      </div>
      
      {/* Enhanced futuristic animated task text with additional effects */}
      <motion.div 
        ref={textRef}
        className="mt-4 xs:mt-5 sm:mt-6 md:mt-8 text-center font-mono font-light tracking-wider relative"
        style={{
          color: state === 'success' 
            ? '#10B981'
            : state === 'error'
            ? '#EF4444'
            : 'var(--color-foreground, #F1F5F9)',
          fontSize: size === 'sm' ? '0.75rem' : size === 'md' ? '0.875rem' : size === 'lg' ? '1rem' : '1.125rem',
          fontFamily: 'monospace'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {task}
      </motion.div>
    </motion.div>
  );
};

export default UniversalLoader;