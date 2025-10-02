"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface EcoHighlight {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export const EcoHighlights: React.FC = () => {
  const highlights: EcoHighlight[] = [
    {
      id: 'energy',
      title: 'Driven on Clean Energy',
      description: 'You\'ve driven 1,250 km on clean energy',
      icon: '🚗',
      color: 'from-[#8B5CF6] to-[#10B981]'
    },
    {
      id: 'co2',
      title: 'CO2 Savings',
      description: 'You\'ve saved 125 kg of CO2 emissions',
      icon: '🌱',
      color: 'from-[#10B981] to-[#059669]'
    },
    {
      id: 'contributor',
      title: 'Top Contributor',
      description: 'You\'re in the top 15% of eco-drivers',
      icon: '🏆',
      color: 'from-[#F59E0B] to-[#D97706]'
    },
    {
      id: 'efficiency',
      title: 'Energy Efficiency',
      description: 'Your charging efficiency is 94.7%',
      icon: '💡',
      color: 'from-[#3B82F6] to-[#1D4ED8]'
    }
  ];

  return (
    <motion.div
      className="glass rounded-2xl p-6 shadow-lg border border-[#475569]/50 relative overflow-hidden mb-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="absolute inset-0 rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.15)] pointer-events-none"></div>
      
      <h2 className="text-2xl font-bold text-[#F1F5F9] mb-6">Eco Journey Highlights</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {highlights.map((highlight, index) => (
          <motion.div
            key={highlight.id}
            className="flex items-start p-4 bg-gradient-to-r from-[#1E3A5F]/50 to-[#0F2A4A]/30 rounded-xl border border-[#475569]/50 backdrop-blur-sm"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 0 15px rgba(139, 92, 246, 0.2), 0 0 25px rgba(16, 185, 129, 0.2)"
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
          >
            <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r ${highlight.color} flex items-center justify-center mr-4`}>
              <span className="text-xl">{highlight.icon}</span>
            </div>
            <div>
              <h3 className="font-semibold text-[#F1F5F9]">{highlight.title}</h3>
              <p className="text-[#94A3B8] text-sm">{highlight.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};