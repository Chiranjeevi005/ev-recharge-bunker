"use client";

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

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
  const baseClasses = "font-semibold rounded-lg sm:rounded-xl transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0F172A] focus:ring-[#8B5CF6] whitespace-nowrap";
  
  const variantClasses = {
    primary: "bg-[#10B981] text-[#0F172A] hover:bg-[#059669] shadow-md hover:shadow-lg",
    secondary: "bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-md hover:shadow-lg",
    outline: "border-2 border-[#10B981] text-[#10B981] bg-transparent hover:bg-[#10B981] hover:text-[#0F172A]",
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm",
    md: "px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base",
    lg: "px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg",
  };
  
  const glowClasses = glow ? "shadow-lg hover:shadow-[0_0_15px_3px_rgba(16,185,129,0.5)]" : "";
  
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