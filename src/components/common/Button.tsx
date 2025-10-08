"use client";

import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  glow = false,
  className = '',
  ...props
}) => {
  const baseClasses = "font-semibold rounded-md xs:rounded-lg sm:rounded-xl transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1E293B] focus:ring-[#8B5CF6] whitespace-nowrap";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white hover:from-[#7C3AED] hover:to-[#059669] shadow-md hover:shadow-lg",
    secondary: "bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-md hover:shadow-lg",
    outline: "border-2 border-[#8B5CF6] text-[#F1F5F9] bg-transparent hover:bg-[#8B5CF6] hover:text-white",
  };
  
  const sizeClasses = {
    sm: "px-2 py-1 xs:px-3 xs:py-1.5 sm:px-4 sm:py-2 text-[10px] xs:text-xs sm:text-sm",
    md: "px-3 py-1.5 xs:px-4 xs:py-2 sm:px-6 sm:py-3 text-xs sm:text-sm md:text-base",
    lg: "px-4 py-2 xs:px-5 xs:py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 text-sm md:text-base lg:text-lg",
  };
  
  const glowClasses = glow ? "shadow-lg hover:shadow-[0_0_15px_3px_rgba(139,92,246,0.5)]" : "";
  
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${glowClasses} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};