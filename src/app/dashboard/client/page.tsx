"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ClientDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new dashboard page
    router.push('/dashboard');
  }, [router]);

  // Return a consistent background to avoid flash of white with futuristic theme
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155] flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        {/* Gradient shift animation */}
        <motion.div 
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 50% 20%, rgba(5, 150, 105, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)"
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        {/* Tech grid pattern */}
        <div className="absolute inset-0 opacity-10">
          {/* Horizontal lines */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-0 bottom-0 w-px bg-[#8B5CF6]"
              style={{ left: `${i * 5}%` }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
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
              className="absolute left-0 right-0 h-px bg-[#10B981]"
              style={{ top: `${i * 5}%` }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo with glow and pulse effect */}
        <motion.div
          className="relative mb-8"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full blur-2xl"
            style={{
              background: "radial-gradient(circle, rgba(139, 92, 246, 0.8), rgba(16, 185, 129, 0.8))"
            }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
          
          <div className="relative w-24 h-24 bg-gradient-to-r from-[#8B5CF6] to-[#10B981] rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
        </motion.div>
        
        <motion.div 
          className="text-[#F1F5F9] text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Redirecting to your dashboard...
        </motion.div>
        
        {/* Battery loading animation */}
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="relative w-64 h-8 bg-[#334155] border-2 border-[#475569] rounded-lg overflow-hidden">
            {/* Battery terminal */}
            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-3 h-4 bg-[#475569] rounded-r-sm"></div>
            
            {/* Battery fill with gradient and animation */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6] via-[#10B981] to-[#059669] rounded-sm"
              initial={{ width: "0%" }}
              animate={{ width: "70%" }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            />
            
            {/* Animated charging effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 h-4 bg-white mx-1 rounded-full"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scaleY: [0.5, 1.2, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}