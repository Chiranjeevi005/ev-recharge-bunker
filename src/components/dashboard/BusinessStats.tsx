import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

interface BusinessStat {
  id: string;
  name: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  bgColor: string;
}

export const BusinessStats: React.FC = () => {
  const { data: session } = useSession();
  const [stats, setStats] = useState<BusinessStat[]>([
    {
      id: 'savings',
      name: 'Fuel Cost Savings',
      value: 10, // Minimum motivational value
      unit: '₹',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      color: 'from-green-500 to-emerald-400',
      description: "Every rupee saved is a step toward a cleaner tomorrow. Keep charging!",
      bgColor: 'bg-green-500/10'
    },
    {
      id: 'offset',
      name: 'Petrol Offset',
      value: 5, // Minimum motivational value
      unit: 'liters',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4 4 0 003 15z"></path>
        </svg>
      ),
      color: 'from-orange-500 to-amber-500',
      description: "Every liter not burned is a victory for clean air. Great job!",
      bgColor: 'bg-orange-500/10'
    },
    {
      id: 'distance',
      name: 'EV Distance Driven',
      value: 30, // Minimum motivational value
      unit: 'km',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
        </svg>
      ),
      color: 'from-blue-500 to-cyan-400',
      description: "Every kilometer powered by clean energy makes a difference!",
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 'contribution',
      name: 'EV Revolution Contribution',
      value: 1, // Minimum motivational value
      unit: '%',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      ),
      color: 'from-purple-500 to-indigo-500',
      description: "Your contribution matters! Every charge helps build a sustainable future.",
      bgColor: 'bg-purple-500/10'
    }
  ]);
  const [motivationalMessage, setMotivationalMessage] = useState("🚀 Every charge counts! You're making a difference with every session. Keep going!");
  const [loading, setLoading] = useState(true);

  // Update motivational message based on stats
  useEffect(() => {
    if (!loading && stats.some(stat => stat.value > 0)) {
      const totalImpact = stats.reduce((sum, stat) => sum + stat.value, 0);
      
      if (totalImpact > 1000) {
        setMotivationalMessage("🌟 Incredible impact! You're a true EV champion! 🌍");
      } else if (totalImpact > 500) {
        setMotivationalMessage("⚡ Amazing progress! Your commitment to clean energy is inspiring! ✨");
      } else if (totalImpact > 100) {
        setMotivationalMessage("💪 Great job! Every charge brings us closer to a greener future! 🌱");
      } else {
        setMotivationalMessage("🚀 Every charge counts! You're making a difference with every session. Keep going!");
      }
    }
  }, [stats.length, loading]); // Simplified dependencies

  const fetchBusinessStats = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/environmental-impact?userId=${session.user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch business stats data');
      }
      
      const data = await response.json();
      
      // Update stats with real data
      setStats(prevStats => prevStats.map(stat => {
        switch (stat.id) {
          case 'savings':
            return { ...stat, value: data.fuelSavings };
          case 'offset':
            return { ...stat, value: data.petrolOffset };
          case 'distance':
            return { ...stat, value: data.evDistance };
          case 'contribution':
            return { ...stat, value: data.evContribution };
          default:
            return stat;
        }
      }));
    } catch (error) {
      console.error("Error fetching business stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessStats();
    
    // Refresh data every 60 seconds to keep stats current and motivating
    const interval = setInterval(fetchBusinessStats, 60000);
    
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  // Animate values with GSAP when they change - faster animation for more responsive feedback
  useEffect(() => {
    if (!loading) {
      stats.forEach((stat) => {
        gsap.fromTo(
          `.stat-value-${stat.id}`,
          { textContent: 0 },
          {
            textContent: stat.value,
            duration: 0.8, // Faster animation
            ease: "power2.out",
            snap: { textContent: 1 },
            onUpdate: function() {
              if (this["targets"]()[0]) {
                this["targets"]()[0].textContent = Math.ceil(this["targets"]()[0].textContent).toLocaleString();
              }
            }
          }
        );
      });
    }
  }, [loading, stats.length]); 

  return (
    <div className="rounded-2xl p-6 shadow-lg border border-[#475569]/50 bg-[#1E293B]/50">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2">Your EV Journey Impact</h2>
          <p className="text-[#94A3B8]">{motivationalMessage}</p>
        </div>
        <button 
          onClick={fetchBusinessStats}
          className="text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
          title="Refresh stats"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <motion.div 
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * stats.indexOf(stat) }}
            className={`${stat.bgColor} rounded-xl p-4 border border-[#475569]/50 relative overflow-hidden`}
          >
            {/* Glowing edge effect */}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${stat.color} opacity-20 blur-xl`}></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
              
              <div className="text-2xl font-bold text-[#F1F5F9] mb-1">
                <span className={`stat-value-${stat.id}`}>
                  {stat.value}
                </span> 
                <span className="ml-1">{stat.unit}</span>
              </div>
              
              <div className="font-medium text-[#F1F5F9] mb-2">{stat.name}</div>
              <div className="text-xs text-[#94A3B8]">{stat.description}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};