"use client";

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface TestimonialCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`rounded-3xl bg-gradient-to-br from-[#334155]/80 to-[#1E293B]/80 border border-[#475569]/50 backdrop-blur-xl shadow-2xl hover:shadow-[#8B5CF6]/20 transition-all duration-500 ${className}`}
      whileHover={{ 
        y: -5,
        boxShadow: "0 25px 50px -12px rgba(139, 92, 246, 0.25)",
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};