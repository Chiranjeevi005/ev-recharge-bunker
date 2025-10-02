"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface EnvironmentalStat {
  id: string;
  name: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
}

export const EnvironmentalImpact: React.FC = () => {
  const { data: session } = useSession();
  const [stats, setStats] = useState<EnvironmentalStat[]>([
    {
      id: 'co2',
      name: 'Total CO2 Saved',
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
      name: 'Sessions Completed',
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
      name: 'Total kWh Charged',
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
      name: 'Equivalent Trees Saved 🌳',
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnvironmentalImpact = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/dashboard/environmental-impact?userId=${session.user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch environmental impact data');
        }
        
        const data = await response.json();
        
        // Update stats with real data
        setStats(prevStats => prevStats.map(stat => {
          switch (stat.id) {
            case 'co2':
              return { ...stat, value: data.co2Saved };
            case 'sessions':
              return { ...stat, value: data.sessionsCompleted };
            case 'energy':
              return { ...stat, value: Math.round(data.totalEnergyKWh) };
            case 'trees':
              return { ...stat, value: data.treesSaved };
            default:
              return stat;
          }
        }));
      } catch (error) {
        console.error("Error fetching environmental impact:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnvironmentalImpact();
  }, [session]);

  return (
    <div className="rounded-2xl p-6 shadow-lg border border-[#475569]/50 bg-[#1E293B]/50">
      <h2 className="text-2xl font-bold text-[#F1F5F9] mb-6">Your Environmental Impact</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.id}
            className="bg-gradient-to-br from-[#1E3A5F]/50 to-[#0F2A4A]/30 rounded-xl p-4 border border-[#475569]/50 text-center relative"
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
            <div className="text-2xl font-bold text-[#10B981] mb-1">
              {loading ? '...' : stat.value} {stat.unit}
            </div>
            <div className="text-sm text-[#CBD5E1]">{stat.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};