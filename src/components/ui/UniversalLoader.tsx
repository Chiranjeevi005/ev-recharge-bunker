"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface UniversalLoaderProps {
  task?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UniversalLoader: React.FC<UniversalLoaderProps> = ({ 
  task = "Loading...", 
  size = 'md',
  className = '' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const energyRefs = useRef<HTMLDivElement[]>([]);
  
  const sizeClasses = {
    sm: { width: 40, height: 40 },
    md: { width: 60, height: 60 },
    lg: { width: 80, height: 80 },
    xl: { width: 100, height: 100 }
  };
  
  const currentSize = sizeClasses[size];
  const energyCount = 12;

  // Initialize focused GSAP animations
  useEffect(() => {
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
        textShadow: "0 0 8px rgba(139, 92, 246, 0.8), 0 0 15px rgba(16, 185, 129, 0.6), 0 0 25px rgba(5, 150, 105, 0.4)",
        duration: 1,
        ease: "sine.inOut"
      }).to(textRef.current, {
        textShadow: "0 0 4px rgba(139, 92, 246, 0.5), 0 0 8px rgba(16, 185, 129, 0.3), 0 0 15px rgba(5, 150, 105, 0.2)",
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
  }, [task]);

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
    <div 
      ref={containerRef}
      className={`flex flex-col items-center justify-center ${className}`}
    >
      {/* Logo with focused animations */}
      <div className="relative flex items-center justify-center">
        {/* Central glow effect - perfectly centered on logo */}
        <motion.div
          className="absolute inset-0 rounded-full blur-lg"
          style={{
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.4), rgba(16, 185, 129, 0.2), transparent)",
            width: currentSize.width * 1.4,
            height: currentSize.height * 1.4,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
        
        {/* Retained bottom effects - energy flow particles */}
        {Array.from({ length: energyCount }).map((_, i) => (
          <div
            key={`energy-${i}`}
            ref={(el) => { if (el) energyRefs.current[i] = el; }}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              background: i % 3 === 0 
                ? 'rgba(255, 255, 255, 0.9)' 
                : i % 3 === 1 
                  ? 'rgba(16, 185, 129, 0.9)' 
                  : 'rgba(139, 92, 246, 0.9)',
              left: `${50 + gsap.utils.random(-20, 20)}%`,
              top: '100%',
              boxShadow: "0 0 4px currentColor",
            }}
          />
        ))}
        
        {/* Logo image - stable with subtle pulse */}
        <div 
          ref={logoRef}
          className="relative z-10"
        >
          <Image 
            src="/assets/logo.png" 
            alt="EV Bunker Logo" 
            width={currentSize.width}
            height={currentSize.height}
            className="object-contain"
          />
        </div>
      </div>
      
      {/* Enhanced futuristic animated task text with additional effects */}
      <div 
        ref={textRef}
        className="mt-8 text-center font-mono font-light tracking-wider relative"
        style={{
          color: 'var(--color-foreground, #F1F5F9)',
          fontSize: size === 'sm' ? '0.875rem' : size === 'md' ? '1rem' : size === 'lg' ? '1.125rem' : '1.25rem',
          fontFamily: 'monospace'
        }}
      >
        {task}
      </div>
    </div>
  );
};

export default UniversalLoader;