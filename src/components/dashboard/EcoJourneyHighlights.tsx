"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { io } from "socket.io-client";

interface EcoHighlight {
  id: string;
  title: string;
  description: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export const EcoJourneyHighlights: React.FC = () => {
  const [highlights, setHighlights] = useState<EcoHighlight[]>([
    {
      id: 'distance',
      title: 'Clean Energy Distance',
      description: "You've driven 0 km on clean energy",
      value: "0 km",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M18.75 12.75h1.5a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5zM12 6a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 0112 6zM12 18a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 0112 18zM3.75 6.75h1.5a.75.75 0 100-1.5h-1.5a.75.75 0 000 1.5zM5.25 18.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 010 1.5zM3 12a.75.75 0 00-.75.75v1.5a.75.75 0 001.5 0v-1.5A.75.75 0 003 12zM15 12a.75.75 0 00-.75.75v1.5a.75.75 0 001.5 0v-1.5A.75.75 0 0015 12zM9 11.25a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM9 15a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 019 15zM6.75 9.75a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zM17.25 9.75a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5z" />
          <path d="M7.125 12.75a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zm-.75 3.75a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5z" />
        </svg>
      ),
      color: 'from-blue-500 to-cyan-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 'carbon',
      title: 'Carbon Impact',
      description: "Your EV charging saved 0 kg CO₂ – equal to planting 0 trees",
      value: "0 kg",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 01-.189-.866c0-.298.059-.605.189-.866zm2.023 6.828a.75.75 0 10-1.06-1.06 3.75 3.75 0 01-5.304 0 .75.75 0 00-1.06 1.06 5.25 5.25 0 007.424 0z" clipRule="evenodd" />
        </svg>
      ),
      color: 'from-green-500 to-emerald-400',
      bgColor: 'bg-green-500/10'
    },
    {
      id: 'rank',
      title: 'Green Contributor Rank',
      description: "You're in the Top 0% eco-contributors in your city this month",
      value: "0%",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
        </svg>
      ),
      color: 'from-amber-500 to-orange-400',
      bgColor: 'bg-amber-500/10'
    }
  ]);
  const [loading, setLoading] = useState(true);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Get user ID from session (simplified for this example)
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || 'test-user' : 'test-user';

  useEffect(() => {
    const fetchEcoHighlights = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/dashboard/environmental-impact?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch eco highlights data');
        }
        
        const data = await response.json();
        
        // Update highlights with real data
        setHighlights(prev => prev.map(highlight => {
          switch (highlight.id) {
            case 'distance':
              // Use totalDistance from the new API response instead of evDistance
              return { 
                ...highlight, 
                description: `You've driven ${(data.totalDistance || 0).toLocaleString()} km on clean energy`,
                value: `${(data.totalDistance || 0).toLocaleString()} km`
              };
            case 'carbon':
              // Use co2Prevented from the new API response instead of co2Saved
              return { 
                ...highlight, 
                description: `Your EV charging saved ${(data.co2Prevented || 0).toLocaleString()} kg CO₂ – equal to planting 0 trees`,
                value: `${(data.co2Prevented || 0).toLocaleString()} kg`
              };
            case 'rank':
              // Use rankPercentile from the new API response
              return { 
                ...highlight, 
                description: `You're in the Top ${(data.rankPercentile || 0)}% eco-contributors in your city this month`,
                value: `${(data.rankPercentile || 0)}%`
              };
            default:
              return highlight;
          }
        }));
      } catch (error) {
        console.error("Error fetching eco highlights:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEcoHighlights();
  }, [userId]);

  // Initialize socket connection and set up listeners
  useEffect(() => {
    const socket = io({
      path: "/api/socketio"
    });

    // Join user room
    socket.emit("join-user-room", userId);

    // Listen for real-time updates
    socket.on("payment-update", (data: any) => {
      console.log("Received payment update:", data);
      // Refresh highlights when a payment completes
      const fetchEcoHighlightsInner = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/dashboard/environmental-impact?userId=${userId}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch eco highlights data');
          }
          
          const data = await response.json();
          
          // Update highlights with real data
          setHighlights(prev => prev.map(highlight => {
            switch (highlight.id) {
              case 'distance':
                // Use totalDistance from the new API response instead of evDistance
                return { 
                  ...highlight, 
                  description: `You've driven ${(data.totalDistance || 0).toLocaleString()} km on clean energy`,
                  value: `${(data.totalDistance || 0).toLocaleString()} km`
                };
              case 'carbon':
                // Use co2Prevented from the new API response instead of co2Saved
                return { 
                  ...highlight, 
                  description: `Your EV charging saved ${(data.co2Prevented || 0).toLocaleString()} kg CO₂ – equal to planting 0 trees`,
                  value: `${(data.co2Prevented || 0).toLocaleString()} kg`
                };
              case 'rank':
                // Use rankPercentile from the new API response
                return { 
                  ...highlight, 
                  description: `You're in the Top ${(data.rankPercentile || 0)}% eco-contributors in your city this month`,
                  value: `${(data.rankPercentile || 0)}%`
                };
              default:
                return highlight;
            }
          }));
        } catch (error) {
          console.error("Error fetching eco highlights:", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchEcoHighlightsInner();
    });

    // Clean up socket listeners
    return () => {
      socket.off("payment-update");
      socket.disconnect();
    };
  }, [userId]);

  // Set ref for icon elements
  const setIconRef = (index: number) => (el: HTMLDivElement | null) => {
    iconRefs.current[index] = el;
  };

  // Animate icons with GSAP
  useEffect(() => {
    if (!loading) {
      iconRefs.current.forEach((iconRef, index) => {
        if (iconRef) {
          gsap.to(iconRef, {
            scale: 1.1,
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut",
            delay: index * 0.2
          });
        }
      });
    }
  }, [loading]);

  return (
    <div className="rounded-2xl p-6 shadow-lg border border-[#475569]/50 bg-[#1E293B]/50">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2">🌍 Eco Journey Highlights</h2>
        <p className="text-[#94A3B8]">See how your EV journey is driving change, saving the planet, and making you a part of the green revolution.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {highlights.map((highlight, index) => (
          <motion.div
            key={highlight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${highlight.bgColor} rounded-xl p-4 border border-[#475569]/50 relative overflow-hidden`}
          >
            {/* Glowing edge effect */}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${highlight.color} opacity-20 blur-xl`}></div>
            
            {/* Glowing badge in top right corner */}
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-[#1E293B]"></div>
            </div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div 
                  ref={setIconRef(index)}
                  className={`w-12 h-12 rounded-full bg-gradient-to-r ${highlight.color} flex items-center justify-center relative`}
                >
                  {highlight.icon}
                  {/* Pulsing glow effect */}
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${highlight.color} opacity-50 blur-md animate-pulse`}></div>
                </div>
              </div>
              
              <div className="text-2xl font-bold text-[#F1F5F9] mb-1">
                <span className={`stat-value-${highlight.id}`}>
                  {loading ? '...' : highlight.value}
                </span>
              </div>
              
              <div className="font-medium text-[#F1F5F9] mb-2">{highlight.title}</div>
              <div className="text-xs text-[#94A3B8]">{loading ? 'Loading...' : highlight.description}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};