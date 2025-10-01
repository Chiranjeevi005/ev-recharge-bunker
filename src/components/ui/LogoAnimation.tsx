"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Image from 'next/image';

interface LogoAnimationProps {
  state?: 'loading' | 'success' | 'idle' | 'transition';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  disableGlow?: boolean;
  disableParticles?: boolean;
}

export const LogoAnimation: React.FC<LogoAnimationProps> = ({ 
  state = 'idle',
  size = 'md',
  className = '',
  showText = false,
  disableGlow = false,
  disableParticles = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const glowRef = useRef<HTMLDivElement>(null);
  const energyRingsRef = useRef<HTMLDivElement[]>([]);
  
  const sizeClasses = {
    sm: { width: 40, height: 40 },
    md: { width: 80, height: 80 },
    lg: { width: 120, height: 120 },
    xl: { width: 160, height: 160 }
  };
  
  const currentSize = sizeClasses[size];

  // Initialize GSAP animations
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Kill any existing animations
    gsap.killTweensOf([logoRef.current, textRef.current, glowRef.current]);
    
    // Clear particle animations
    particlesRef.current.forEach(particle => {
      if (particle) gsap.killTweensOf(particle);
    });
    
    energyRingsRef.current.forEach(ring => {
      if (ring) gsap.killTweensOf(ring);
    });
    
    // Animate based on state
    switch (state) {
      case 'loading':
        // Logo rotation and pulse
        if (logoRef.current) {
          gsap.to(logoRef.current, {
            rotation: 360,
            duration: 4,
            repeat: -1,
            ease: "none"
          });
        }
        
        // Glow pulsing effect
        if (glowRef.current && !disableGlow) {
          gsap.to(glowRef.current, {
            scale: 1.8,
            opacity: 0.7,
            duration: 1.5,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
          });
        }
        
        // Text animation
        if (textRef.current && showText) {
          gsap.fromTo(textRef.current, 
            { opacity: 0, y: 20 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 1,
              ease: "power2.out"
            }
          );
          
          // Text gradient animation
          gsap.to(textRef.current, {
            backgroundPosition: '200% 0',
            duration: 3,
            repeat: -1,
            ease: "linear"
          });
        }
        
        // Energy rings
        energyRingsRef.current.forEach((ring, i) => {
          if (ring) {
            gsap.fromTo(ring,
              { scale: 0, opacity: 0.8 },
              { 
                scale: 2, 
                opacity: 0,
                duration: 2,
                delay: i * 0.5,
                repeat: -1,
                ease: "power1.out"
              }
            );
          }
        });
        
        // Particles
        if (!disableParticles) {
          particlesRef.current.forEach((particle, i) => {
            if (particle) {
              gsap.to(particle, {
                x: gsap.utils.random(-100, 100),
                y: gsap.utils.random(-100, 100),
                opacity: 0,
                duration: gsap.utils.random(2, 4),
                repeat: -1,
                delay: i * 0.2,
                ease: "power1.out"
              });
            }
          });
        }
        break;
        
      case 'success':
        // Success burst animation
        if (logoRef.current) {
          gsap.fromTo(logoRef.current,
            { scale: 0.8 },
            { 
              scale: 1.2, 
              duration: 0.3,
              yoyo: true,
              repeat: 1,
              ease: "power2.out"
            }
          );
        }
        
        // Glow burst
        if (glowRef.current && !disableGlow) {
          gsap.fromTo(glowRef.current,
            { scale: 1, opacity: 0.5 },
            { 
              scale: 3, 
              opacity: 0,
              duration: 1,
              ease: "power2.out"
            }
          );
        }
        
        // Text success animation
        if (textRef.current && showText) {
          gsap.fromTo(textRef.current,
            { opacity: 0, scale: 0.8 },
            { 
              opacity: 1, 
              scale: 1, 
              duration: 0.5,
              ease: "back.out(1.7)"
            }
          );
        }
        
        // Particles burst
        if (!disableParticles) {
          particlesRef.current.forEach((particle, i) => {
            if (particle) {
              gsap.fromTo(particle,
                { opacity: 1, scale: 0 },
                { 
                  opacity: 0, 
                  scale: gsap.utils.random(1, 2),
                  x: gsap.utils.random(-150, 150),
                  y: gsap.utils.random(-150, 150),
                  duration: 1.5,
                  delay: i * 0.05,
                  ease: "power2.out"
                }
              );
            }
          });
        }
        break;
        
      case 'transition':
        // Quick refresh animation
        if (logoRef.current) {
          gsap.fromTo(logoRef.current,
            { rotation: 0 },
            { 
              rotation: 180, 
              duration: 0.5,
              yoyo: true,
              repeat: 1,
              ease: "power1.inOut"
            }
          );
        }
        
        // Glow pulse
        if (glowRef.current && !disableGlow) {
          gsap.fromTo(glowRef.current,
            { scale: 1, opacity: 0.3 },
            { 
              scale: 1.5, 
              opacity: 0,
              duration: 0.8,
              ease: "power1.out"
            }
          );
        }
        
        // Text refresh
        if (textRef.current && showText) {
          gsap.fromTo(textRef.current,
            { opacity: 1 },
            { 
              opacity: 0.5, 
              duration: 0.3,
              yoyo: true,
              repeat: 1,
              ease: "sine.inOut"
            }
          );
        }
        break;
        
      case 'idle':
      default:
        // Breathing animation
        if (logoRef.current) {
          gsap.to(logoRef.current, {
            scale: 1.05,
            duration: 2,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
          });
        }
        
        // Subtle glow
        if (glowRef.current && !disableGlow) {
          gsap.to(glowRef.current, {
            scale: 1.3,
            opacity: 0.4,
            duration: 3,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
          });
        }
        
        // Text idle animation
        if (textRef.current && showText) {
          gsap.to(textRef.current, {
            opacity: 0.9,
            duration: 2,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
          });
        }
        
        // Gentle particle movement
        if (!disableParticles) {
          particlesRef.current.forEach((particle, i) => {
            if (particle) {
              gsap.to(particle, {
                x: `+=${gsap.utils.random(-10, 10)}`,
                y: `+=${gsap.utils.random(-10, 10)}`,
                opacity: gsap.utils.random(0.2, 0.6),
                duration: gsap.utils.random(3, 6),
                repeat: -1,
                delay: i * 0.5,
                ease: "sine.inOut"
              });
            }
          });
        }
        break;
    }
    
    // Cleanup function
    return () => {
      gsap.killTweensOf([logoRef.current, textRef.current, glowRef.current]);
      particlesRef.current.forEach(particle => {
        if (particle) gsap.killTweensOf(particle);
      });
      energyRingsRef.current.forEach(ring => {
        if (ring) gsap.killTweensOf(ring);
      });
    };
  }, [state, showText, disableGlow, disableParticles]);

  return (
    <div 
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center ${className}`}
    >
      {/* Glow effect */}
      {!disableGlow && (
        <div
          ref={glowRef}
          className="absolute inset-0 rounded-full blur-2xl"
          style={{
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.6), rgba(16, 185, 129, 0.4), transparent 70%)",
            opacity: 0.3
          }}
        />
      )}
      
      {/* Energy rings */}
      {!disableGlow && (
        <>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              ref={(el) => { if (el) energyRingsRef.current[i] = el; }}
              className="absolute rounded-full border-2"
              style={{
                borderColor: i % 2 === 0 ? 'rgba(139, 92, 246, 0.4)' : 'rgba(16, 185, 129, 0.4)',
                width: '100%',
                height: '100%'
              }}
            />
          ))}
        </>
      )}
      
      {/* Animated logo */}
      <div 
        ref={logoRef}
        className="relative z-10"
      >
        <Image 
          src="/assets/logo.png" 
          alt="EV Bunker Logo" 
          width={currentSize.width} 
          height={currentSize.height} 
          className="object-contain drop-shadow-lg"
        />
      </div>
      
      {/* Animated text */}
      {showText && (
        <span 
          ref={textRef}
          className="mt-4 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#10B981] to-[#8B5CF6] bg-[200%_auto]"
        >
          EV Bunker
        </span>
      )}
      
      {/* Particles */}
      {!disableParticles && (
        <>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              ref={(el) => { if (el) particlesRef.current[i] = el; }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: i % 3 === 0 
                  ? 'rgba(139, 92, 246, 0.8)' 
                  : i % 3 === 1 
                    ? 'rgba(16, 185, 129, 0.8)' 
                    : 'rgba(5, 150, 105, 0.8)',
                top: '50%',
                left: '50%',
                opacity: gsap.utils.random(0.3, 0.7)
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default LogoAnimation;