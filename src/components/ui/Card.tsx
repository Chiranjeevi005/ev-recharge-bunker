"use client";

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ 
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
      className={`rounded-3xl bg-[#334155] border border-[#475569] backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-[#8B5CF6]/20 transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};