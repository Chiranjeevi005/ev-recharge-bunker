"use client";

import React, { useState, useEffect } from 'react';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';

interface LiveStat {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  color: string;
  icon: React.ReactNode;
}

export const LiveOperationsTracker: React.FC = () => {
  const { data, loading, error } = useRealTimeData();
  const [liveStats, setLiveStats] = useState<LiveStat[]>([
    {
      id: 'active-sessions',
      name: 'Active Sessions',
      value: 0,
      unit: '',
      change: 0,
      color: 'from-blue-500 to-cyan-400',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      )
    },
    {
      id: 'total-energy',
      name: 'Energy Delivered',
      value: 0,
      unit: 'kWh',
      change: 0,
      color: 'from-green-500 to-emerald-400',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )
    },
    {
      id: 'co2-saved',
      name: 'CO₂ Saved',
      value: 0,
      unit: 'kg',
      change: 0,
      color: 'from-purple-500 to-indigo-500',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
        </svg>
      )
    },
    {
      id: 'total-payments',
      name: 'Payments',
      value: 0,
      unit: '₹',
      change: 0,
      color: 'from-orange-500 to-amber-500',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )
    }
  ]);

  // Update live stats based on real-time data
  useEffect(() => {
    if (!loading && data) {
      // Calculate active sessions
      const activeSessions = data.chargingSessions.filter(session => 
        session.status === 'active' || session.status === 'charging'
      ).length;

      // Calculate total energy delivered
      const totalEnergy = data.chargingSessions.reduce((sum, session) => 
        sum + (session.totalEnergyKWh || session.energyConsumed || 0), 0
      );

      // Calculate CO₂ saved
      const co2Saved = data.ecoStats.reduce((sum, stat) => 
        sum + (stat.co2Saved || 0), 0
      );

      // Calculate total payments
      const totalPayments = data.payments.reduce((sum, payment) => 
        sum + (payment.amount || 0), 0
      );

      // Update stats with animation
      setLiveStats(prev => prev.map(stat => {
        let newValue = stat.value;
        let newChange = stat.change;

        switch (stat.id) {
          case 'active-sessions':
            newValue = activeSessions;
            newChange = newValue - stat.value;
            break;
          case 'total-energy':
            newValue = Math.round(totalEnergy);
            newChange = newValue - stat.value;
            break;
          case 'co2-saved':
            newValue = Math.round(co2Saved);
            newChange = newValue - stat.value;
            break;
          case 'total-payments':
            newValue = Math.round(totalPayments);
            newChange = newValue - stat.value;
            break;
        }

        // Animate the value change with GSAP
        if (newValue !== stat.value) {
          gsap.fromTo(
            `.stat-value-${stat.id}`,
            { textContent: stat.value },
            {
              textContent: newValue,
              duration: 1,
              ease: "power2.out",
              snap: { textContent: 1 },
              onUpdate: function() {
                if (this["targets"]()[0]) {
                  this["targets"]()[0].textContent = Math.ceil(this["targets"]()[0].textContent).toLocaleString();
                }
              }
            }
          );
        }

        return {
          ...stat,
          value: newValue,
          change: newChange
        };
      }));
    }
  }, [data, loading]);

  // Format timestamp for activity log
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get status color for activity log
  const getStatusColor = (event: any) => {
    switch (event.event) {
      case 'charging_session_update':
        return event.operationType === 'insert' ? 'text-blue-400' : 
               event.operationType === 'update' ? 'text-blue-400' : 'text-red-400';
      case 'payment_update':
        return event.operationType === 'insert' ? 'text-green-400' : 
               event.operationType === 'update' ? 'text-green-400' : 'text-red-400';
      case 'client_update':
        return event.operationType === 'insert' ? 'text-purple-400' : 
               event.operationType === 'update' ? 'text-purple-400' : 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  // Get event description for activity log
  const getEventDescription = (event: any) => {
    switch (event.event) {
      case 'charging_session_update':
        if (event.operationType === 'insert') {
          return `New charging session started for user ${event.fullDocument?.userId || 'Unknown'}`;
        } else if (event.operationType === 'update') {
          return `Charging session updated for user ${event.fullDocument?.userId || 'Unknown'}`;
        } else {
          return `Charging session ended for user ${event.fullDocument?.userId || 'Unknown'}`;
        }
      case 'payment_update':
        if (event.operationType === 'insert') {
          return `Payment of ₹${event.fullDocument?.amount || 0} completed for user ${event.fullDocument?.userId || 'Unknown'}`;
        } else if (event.operationType === 'update') {
          return `Payment status updated for user ${event.fullDocument?.userId || 'Unknown'}`;
        } else {
          return `Payment record removed for user ${event.fullDocument?.userId || 'Unknown'}`;
        }
      case 'client_update':
        if (event.operationType === 'insert') {
          return `New client registered: ${event.fullDocument?.name || 'Unknown'}`;
        } else if (event.operationType === 'update') {
          return `Client profile updated: ${event.fullDocument?.name || 'Unknown'}`;
        } else {
          return `Client account deactivated: ${event.fullDocument?.name || 'Unknown'}`;
        }
      default:
        return 'System activity';
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl p-6 shadow-lg border border-[#475569]/50 bg-[#1E293B]/50">
        <div className="animate-pulse">
          <div className="h-6 bg-[#334155] rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-[#334155] rounded w-2/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-[#334155] rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl p-6 shadow-lg border border-[#475569]/50 bg-[#1E293B]/50">
        <div className="text-center py-8">
          <div className="text-red-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[#F1F5F9] mb-2">Connection Error</h3>
          <p className="text-[#94A3B8] mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 shadow-lg border border-[#475569]/50 bg-[#1E293B]/50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#F1F5F9] flex items-center">
              ⚡ Live Operations Tracker
            </h2>
            <p className="text-[#94A3B8]">Monitor and control all client activities in real-time — powered by MongoDB and Redis</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm text-green-400">Live</span>
          </div>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {liveStats.map((stat) => (
          <motion.div 
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * liveStats.indexOf(stat) }}
            className="rounded-xl p-4 border border-[#475569]/50 relative overflow-hidden bg-[#1E293B]"
          >
            {/* Glowing edge effect */}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${stat.color} opacity-20 blur-xl`}></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  {stat.icon}
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  stat.change >= 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                }`}>
                  {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change)}
                </div>
              </div>
              
              <div className="text-xl font-bold text-[#F1F5F9] mb-1">
                <span className={`stat-value-${stat.id}`}>
                  {stat.value}
                </span> 
                <span className="ml-1 text-sm">{stat.unit}</span>
              </div>
              
              <div className="text-xs text-[#94A3B8]">{stat.name}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Activity Feed */}
      <div className="rounded-xl border border-[#475569]/50 bg-[#1E293B] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#475569]/50">
          <h3 className="font-bold text-[#F1F5F9]">Recent Activity</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <AnimatePresence>
            {data.activityLog.length > 0 ? (
              data.activityLog.map((event, index) => (
                <motion.div
                  key={`${event.timestamp}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="px-4 py-3 border-b border-[#475569]/30 last:border-b-0 hover:bg-[#334155]/20"
                >
                  <div className="flex items-start">
                    <div className={`mr-3 mt-1 text-sm ${getStatusColor(event)}`}>
                      {event.event === 'charging_session_update' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                      )}
                      {event.event === 'payment_update' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      )}
                      {event.event === 'client_update' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#F1F5F9] text-sm truncate">
                        {getEventDescription(event)}
                      </p>
                      <p className="text-[#94A3B8] text-xs">
                        {formatTimestamp(event.timestamp)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <div className="text-[#94A3B8] mb-2">
                  <svg className="w-12 h-12 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                  </svg>
                </div>
                <p className="text-[#94A3B8]">No recent activity</p>
                <p className="text-[#94A3B8] text-sm mt-1">Live updates will appear here as they happen</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};