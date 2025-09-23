"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { EnergyAnimation } from '@/components/ui/EnergyAnimation';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, rotate: 0 }}
      animate={{ 
        scale: 1,
        rotate: [0, 5, -5, 0],
      }}
      transition={{ 
        scale: { duration: 0.3 },
        rotate: { duration: 2, repeat: Infinity, repeatType: "reverse" }
      }}
      whileHover={{ 
        scale: 1.1,
        boxShadow: "0 0 20px rgba(139, 92, 246, 0.8), 0 0 30px rgba(16, 185, 129, 0.8)"
      }}
      whileTap={{ scale: 0.9 }}
    >
      <button
        onClick={onClick}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
        aria-label="Book & Pay"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        
        {/* Energy animation inside the button */}
        <div className="absolute inset-0 opacity-20">
          <EnergyAnimation />
        </div>
      </button>
      
      {/* Glow effect */}
      <motion.div 
        className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] opacity-30 blur-md"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      ></motion.div>
    </motion.div>
  );
};