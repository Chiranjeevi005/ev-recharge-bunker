"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EnergyAnimation } from '@/components/ui/EnergyAnimation';

interface Stat {
  id: number;
  name: string;
  value: string;
  targetValue: number;
}

export const QuickStats: React.FC = () => {
  const [stats, setStats] = useState<Stat[]>([
    { id: 1, name: 'EVs Charged', value: '0', targetValue: 1245 },
    { id: 2, name: 'Active Bunks', value: '0', targetValue: 89 },
    { id: 3, name: 'Trips Completed', value: '0', targetValue: 3421 },
  ]);

  // Animate counters on mount
  useEffect(() => {
    const timers = stats.map((stat, index) => {
      return setTimeout(() => {
        // Animate the counter from 0 to target value
        const increment = Math.ceil(stat.targetValue / 50);
        let currentValue = 0;
        
        const counter = setInterval(() => {
          currentValue += increment;
          if (currentValue >= stat.targetValue) {
            currentValue = stat.targetValue;
            clearInterval(counter);
          }
          
          setStats(prevStats => 
            prevStats.map(s => 
              s.id === stat.id 
                ? { ...s, value: currentValue.toLocaleString() } 
                : s
            )
          );
        }, 20);
      }, index * 200);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  return (
    <section className="py-12 bg-[#1E293B] relative overflow-hidden">
      {/* Background energy animations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-16 h-16 opacity-10">
          <EnergyAnimation />
        </div>
        <div className="absolute bottom-1/3 right-1/3 w-20 h-20 opacity-10">
          <EnergyAnimation />
        </div>
      </div>
      
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <motion.div
              key={stat.id}
              className="bg-[#334155]/50 backdrop-blur-sm rounded-xl p-6 border border-[#475569]/50 relative overflow-hidden"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 20px rgba(139, 92, 246, 0.3), 0 0 30px rgba(16, 185, 129, 0.3)"
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: stat.id * 0.1 }}
            >
              {/* Inner energy animation */}
              <div className="absolute top-2 right-2 w-8 h-8 opacity-20">
                <EnergyAnimation />
              </div>
              
              <dt className="text-sm font-medium text-[#94A3B8] truncate relative z-10">{stat.name}</dt>
              <dd className="mt-1 text-3xl font-semibold text-white relative z-10">
                {stat.value}
              </dd>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};