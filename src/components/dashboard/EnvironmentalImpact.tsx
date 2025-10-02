"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface EnvironmentalStat {
  id: string;
  name: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
}

export const EnvironmentalImpact: React.FC = () => {
  const [stats, setStats] = useState<EnvironmentalStat[]>([
    {
      id: 'co2',
      name: 'CO2 Saved',
      value: 0,
      unit: 'kg',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
        </svg>
      ),
      color: 'from-green-500 to-emerald-400'
    },
    {
      id: 'sessions',
      name: 'Sessions',
      value: 0,
      unit: '',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      color: 'from-purple-500 to-indigo-500'
    },
    {
      id: 'energy',
      name: 'kWh Charged',
      value: 0,
      unit: 'kWh',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      ),
      color: 'from-amber-500 to-orange-500'
    },
    {
      id: 'trees',
      name: 'Trees Saved',
      value: 0,
      unit: '',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
        </svg>
      ),
      color: 'from-emerald-500 to-green-400'
    }
  ]);

  // Animate counters on mount
  useEffect(() => {
    // In a real implementation, these would come from an API
    const targetValues = [
      { id: 'co2', value: 125 },      // CO2 Saved in kg
      { id: 'sessions', value: 24 },   // Sessions Completed
      { id: 'energy', value: 847 },    // kWh Charged
      { id: 'trees', value: 3 }        // Trees Saved
    ];

    const timers = targetValues.map((target, index) => {
      return setTimeout(() => {
        const increment = Math.ceil(target.value / 50);
        let currentValue = 0;
        
        const counter = setInterval(() => {
          currentValue += increment;
          if (currentValue >= target.value) {
            currentValue = target.value;
            clearInterval(counter);
          }
          
          setStats(prevStats => 
            prevStats.map(stat => 
              stat.id === target.id 
                ? { ...stat, value: currentValue } 
                : stat
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
    <motion.div 
      className="glass rounded-2xl p-6 shadow-lg border border-[#475569]/50 relative overflow-hidden mb-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="absolute inset-0 rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.15)] pointer-events-none"></div>
      
      <h2 className="text-2xl font-bold text-[#F1F5F9] mb-6">Your Environmental Impact</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div 
            key={stat.id}
            className="bg-gradient-to-br from-[#1E3A5F]/50 to-[#0F2A4A]/30 rounded-xl p-4 border border-[#475569]/50 backdrop-blur-sm text-center relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {/* Glowing badge in top right corner */}
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-[#1E293B]"></div>
            </div>
            
            <div className="relative inline-block mb-2">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center mx-auto`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-2xl font-bold text-[#10B981] glow-text">{stat.value} {stat.unit}</div>
            <div className="text-sm text-[#CBD5E1]">{stat.name}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};