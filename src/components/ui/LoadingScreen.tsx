"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[#1E293B] flex items-center justify-center z-50">
      {/* Animated circuit grid background */}
      <div className="absolute inset-0 z-0">
        {/* Horizontal lines */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-[#8B5CF6]/20"
            style={{ left: `${i * 5}%` }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
        
        {/* Vertical lines */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-0 right-0 h-px bg-[#10B981]/20"
            style={{ top: `${i * 5}%` }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
      
      <div className="text-center relative z-10">
        {/* Futuristic Battery Charging Animation */}
        <motion.div
          className="relative mx-auto mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Battery Outline */}
          <div className="relative w-32 h-48 mx-auto">
            {/* Battery Body */}
            <div className="absolute inset-0 rounded-lg bg-[#334155] border-2 border-[#475569] flex flex-col items-center justify-end p-2">
              {/* Charging Liquid Animation */}
              <motion.div 
                className="w-full rounded-b-md bg-gradient-to-t from-[#10B981] to-[#059669]"
                initial={{ height: "0%" }}
                animate={{ height: "100%" }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              />
              
              {/* Battery Terminal */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-[#475569] rounded-t-md"></div>
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-[#8B5CF6] rounded-t-sm"></div>
            </div>
            
            {/* Charging Sparks */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-[#8B5CF6]"
                style={{
                  top: `${10 + i * 15}%`,
                  left: `${20 + (i % 2) * 60}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.5, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
          
          {/* Charging Cable */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="w-1 h-8 bg-[#475569] mx-auto"></div>
            <div className="w-6 h-2 bg-[#8B5CF6] rounded-b-md"></div>
          </div>
        </motion.div>
        
        <motion.h2 
          className="text-3xl font-bold text-[#F1F5F9] mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Charging Your Future
        </motion.h2>
        
        <motion.div 
          className="w-80 h-3 bg-[#334155] rounded-full mx-auto overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div 
            className="h-full bg-gradient-to-r from-[#8B5CF6] via-[#10B981] to-[#059669]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          />
        </motion.div>
      </div>
    </div>
  );
};