"use client";

import React from 'react';

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
      title: 'Clean Energy Milestone',
      description: 'You\'ve driven 1200 km on clean energy',
      icon: '🚗',
      color: 'from-[#8B5CF6] to-[#10B981]'
    },
    {
      id: 'co2',
      title: 'CO2 Savings',
      description: 'Your EV charging saved 95kg CO2 – equal to planting 4 trees',
      icon: '🌱',
      color: 'from-[#10B981] to-[#059669]'
    },
    {
      id: 'contributor',
      title: 'Top Contributor',
      description: 'Top 5% green contributors in your city this month',
      icon: '🏆',
      color: 'from-[#F59E0B] to-[#D97706]'
    }
  ];

  return (
    <div className="rounded-2xl p-6 shadow-lg border border-[#475569]/50 relative overflow-hidden bg-[#1E293B]/50">
      <h2 className="text-2xl font-bold text-[#F1F5F9] mb-6">Eco Journey Highlights</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {highlights.map((highlight) => (
          <div
            key={highlight.id}
            className="flex items-start p-4 bg-gradient-to-r from-[#1E3A5F]/50 to-[#0F2A4A]/30 rounded-xl border border-[#475569]/50 backdrop-blur-sm"
          >
            <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r ${highlight.color} flex items-center justify-center mr-4`}>
              <span className="text-xl">{highlight.icon}</span>
            </div>
            <div>
              <h3 className="font-semibold text-[#F1F5F9]">{highlight.title}</h3>
              <p className="text-[#94A3B8] text-sm">{highlight.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};