import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { useLoader } from '@/context/LoaderContext';
import io from 'socket.io-client';

interface ImpactStat {
  id: string;
  name: string;
  value: number;
  unit: string;
  color: string;
  description: string;
  bgColor: string;
  icon: React.ReactNode;
}

export const JourneyImpactStats: React.FC = () => {
  const { data: session } = useSession();
  const { showLoader, hideLoader } = useLoader();
  const socketRef = useRef<any>(null);
  const valueRefs = useRef<{[key: string]: HTMLElement | null}>({}); // For GSAP animations
  const [stats, setStats] = useState<ImpactStat[]>([
    {
      id: 'energy',
      name: 'Total Green Energy Charged',
      value: 0,
      unit: 'kWh',
      color: 'from-blue-500 to-cyan-400',
      description: '⚡ Every kWh charged fuels a cleaner tomorrow!',
      bgColor: 'bg-blue-500/10',
      icon: (
        <svg className="w-4 xs:w-5 sm:w-6 md:w-7 h-4 xs:h-5 sm:h-6 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      )
    },
    {
      id: 'co2',
      name: 'CO₂ Emissions Prevented',
      value: 0,
      unit: 'kg CO₂',
      color: 'from-green-500 to-emerald-400',
      description: '🌱 You\'re saving the planet — one charge at a time.',
      bgColor: 'bg-green-500/10',
      icon: (
        <svg className="w-4 xs:w-5 sm:w-6 md:w-7 h-4 xs:h-5 sm:h-6 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
        </svg>
      )
    },
    {
      id: 'duration',
      name: 'Station Usage Duration',
      value: 0,
      unit: 'Minutes',
      color: 'from-purple-500 to-violet-400',
      description: '🕒 Time well spent! Every minute drives change.',
      bgColor: 'bg-purple-500/10',
      icon: (
        <svg className="w-4 xs:w-5 sm:w-6 md:w-7 h-4 xs:h-5 sm:h-6 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )
    },
    {
      id: 'savings',
      name: 'Cost Savings vs. Petrol',
      value: 0,
      unit: '₹',
      color: 'from-orange-500 to-amber-400',
      description: '💰 Your smart choice saves both money and Earth!',
      bgColor: 'bg-orange-500/10',
      icon: (
        <svg className="w-4 xs:w-5 sm:w-6 md:w-7 h-4 xs:h-5 sm:h-6 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )
    },
    {
      id: 'rank',
      name: 'Community Impact Rank',
      value: 0,
      unit: '%',
      color: 'from-amber-400 to-yellow-500',
      description: '🏆 You\'re among the top eco-warriors this week!',
      bgColor: 'bg-amber-400/10',
      icon: (
        <svg className="w-4 xs:w-5 sm:w-6 md:w-7 h-4 xs:h-5 sm:h-6 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
        </svg>
      )
    }
  ]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  // Fetch impact stats from API
  const fetchImpactStats = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      showLoader("Updating your impact stats...");
      
      const response = await fetch(`/api/dashboard/environmental-impact?userId=${session.user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch impact stats data');
      }
      
      const data = await response.json();
      
      // Use the values directly from the API response
      const totalEnergy = data.totalKWh || 0;
      const co2Prevented = data.co2Prevented || 0; // kg CO₂
      const totalDuration = data.totalDuration || 0; // minutes
      const costSavings = data.costSavings || 0; // ₹
      const communityRank = data.rankPercentile || 0; // %

      // Update stats with real data
      setStats(prevStats => prevStats.map(stat => {
        switch (stat.id) {
          case 'energy':
            return { ...stat, value: Math.round(totalEnergy) };
          case 'co2':
            return { ...stat, value: Math.round(co2Prevented) };
          case 'duration':
            return { ...stat, value: Math.round(totalDuration) };
          case 'savings':
            return { ...stat, value: Math.round(costSavings) };
          case 'rank':
            return { ...stat, value: Math.round(communityRank) };
          default:
            return stat;
        }
      }));
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching impact stats:", error);
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  // Animate values with GSAP when they change
  useEffect(() => {
    if (!loading) {
      stats.forEach((stat) => {
        if (valueRefs.current[stat.id]) {
          gsap.fromTo(
            valueRefs.current[stat.id]!,
            { textContent: 0 },
            {
              textContent: stat.value,
              duration: 1.2,
              ease: "power2.out",
              snap: { textContent: 1 },
              onUpdate: function() {
                const targets = this['targets']();
                if (targets && targets[0]) {
                  targets[0].textContent = Math.ceil(targets[0].textContent).toLocaleString();
                }
              }
            }
          );
        }
      });
    }
  }, [stats, loading]);

  // Initialize socket connection and set up listeners
  useEffect(() => {
    if (session?.user?.id) {
      // Initialize socket connection
      socketRef.current = io({
        path: "/api/socketio"
      });

      // Join user room
      socketRef.current.emit("join-user-room", session.user.id);

      // Listen for real-time updates
      socketRef.current.on("payment-update", (data: any) => {
        console.log("Received payment update:", data);
        // Refresh stats when a payment completes
        fetchImpactStats();
      });

      // Clean up socket listeners
      return () => {
        if (socketRef.current) {
          socketRef.current.off("payment-update");
          socketRef.current.disconnect();
        }
      };
    }
    
    // Return a no-op cleanup function for cases where the effect doesn't run
    return () => {};
  }, [session?.user?.id]);

  // Initial data fetch and setup polling
  useEffect(() => {
    fetchImpactStats();
    
    // Refresh data every 60 seconds to keep stats current
    const interval = setInterval(fetchImpactStats, 60000);
    
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  return (
    <div className="rounded-2xl p-2 xs:p-3 sm:p-4 md:p-5 shadow-lg border border-[#475569]/50 bg-[#1E293B]/50 backdrop-blur-sm">
      <div className="mb-2 xs:mb-3 sm:mb-4 flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 xs:gap-3">
        <div>
          <h2 className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-bold text-[#F1F5F9] mb-1">🌍 Your EV Journey Impact</h2>
          <p className="text-[10px] xs:text-xs sm:text-sm text-[#94A3B8]">
            Track your growing contribution to a cleaner planet — every charge, payment, and minute counts.
          </p>
        </div>
        <div className="flex items-center gap-1 xs:gap-2">
          <span className="text-[8px] xs:text-[10px] text-[#94A3B8]">
            Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button 
            onClick={fetchImpactStats}
            disabled={loading}
            className="text-[#94A3B8] hover:text-[#F1F5F9] transition-colors disabled:opacity-50"
            title="Refresh stats"
          >
            <svg className={`w-3 xs:w-4 sm:w-5 h-3 xs:h-4 sm:h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 xs:gap-2 sm:gap-3">
        {stats.map((stat, index) => (
          <motion.div 
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.bgColor} rounded-xl p-2 xs:p-3 border border-[#475569]/50 relative overflow-hidden`}
          >
            {/* Glowing edge effect */}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${stat.color} opacity-20 blur-xl`}></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-1.5 xs:mb-2">
                <div className={`w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  {stat.icon}
                </div>
                {/* Glowing badge in top right corner */}
                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-blue-400 shadow-[0_0_4px_1px_rgba(96,165,250,0.5)]"></div>
              </div>
              
              <div className="text-xs xs:text-sm sm:text-base font-bold text-[#F1F5F9] mb-1">
                <span ref={el => { if (el) valueRefs.current[stat.id] = el; }} className="inline-block min-w-[2ch]">
                  {stat.value}
                </span> 
                <span className="ml-1 text-[10px] xs:text-xs">{stat.unit}</span>
              </div>
              
              <div className="font-medium text-[#F1F5F9] mb-1 text-[10px] xs:text-xs">{stat.name}</div>
              <div className="text-[8px] xs:text-[10px] text-[#94A3B8]">{stat.description}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};