"use client";

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface InputProps extends HTMLMotionProps<"input"> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>((
  { 
    label, 
    error, 
    className = '', 
    ...props 
  }, 
  ref
) => {
  const baseClasses = "w-full px-4 py-3 bg-[#1E293B] border rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent placeholder-[#94A3B8] transition-all duration-200";
  const errorClasses = error ? "border-[#EF4444]" : "border-[#334155]";
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#CBD5E1] mb-2">
          {label}
        </label>
      )}
      <motion.input
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`${baseClasses} ${errorClasses} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-[#EF4444]">{error}</p>
      )}
    </div>
  );
});

Input.displayName = "Input";