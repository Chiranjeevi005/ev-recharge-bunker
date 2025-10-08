"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface ChargingStatusCardProps {
  status: 'available' | 'charging' | 'completed' | 'offline' | 'maintenance';
  stationName?: string;
  slotId?: string;
  startTime?: string;
  endTime?: string;
  loading?: boolean;
  onCancel?: () => void;
}

export const ChargingStatusCard: React.FC<ChargingStatusCardProps> = ({ 
  status,
  stationName,
  slotId,
  startTime,
  endTime,
  loading = false,
  onCancel
}) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'available':
        return {
          title: 'Ready to Charge',
          description: 'Your EV is ready for charging',
          color: 'from-green-500 to-emerald-400',
          icon: (
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          )
        };
      case 'charging':
        return {
          title: 'Charging in Progress',
          description: 'Your EV is currently charging',
          color: 'from-blue-500 to-cyan-400',
          icon: (
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          )
        };
      case 'completed':
        return {
          title: 'Charging Completed',
          description: 'Your charging session has finished',
          color: 'from-green-500 to-emerald-400',
          icon: (
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          )
        };
      case 'offline':
        return {
          title: 'Station Offline',
          description: 'This charging station is currently offline',
          color: 'from-gray-500 to-gray-400',
          icon: (
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
            </svg>
          )
        };
      case 'maintenance':
        return {
          title: 'Under Maintenance',
          description: 'This charging station is under maintenance',
          color: 'from-yellow-500 to-orange-400',
          icon: (
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          )
        };
      default:
        return {
          title: 'Status Unknown',
          description: 'Unable to determine charging status',
          color: 'from-gray-500 to-gray-400',
          icon: (
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          )
        };
    }
  };

  const statusInfo = getStatusInfo();

  if (loading) {
    return (
      <div className="rounded-2xl bg-[#1E293B]/80 border border-[#334155] p-4 sm:p-6">
        <div className="flex flex-col items-center justify-center py-6 sm:py-8">
          <LoadingSpinner size="md" className="mb-3 sm:mb-4" />
          <p className="text-[#94A3B8] text-sm sm:text-base">Loading charging status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#1E293B]/80 border border-[#334155] p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-[#F1F5F9]">Charging Status</h2>
        {status === 'charging' && onCancel && (
          <button
            onClick={onCancel}
            className="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm text-[#EF4444] border border-[#EF4444] rounded-lg hover:bg-[#EF4444]/20 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
      
      <div className="flex items-center p-3 sm:p-4 rounded-xl bg-gradient-to-r from-[#334155] to-[#1E293B] border border-[#475569]/50">
        <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-r ${statusInfo.color} mr-3 sm:mr-4`}>
          {statusInfo.icon}
        </div>
        <div>
          <h3 className="font-bold text-[#F1F5F9] text-sm sm:text-base">{statusInfo.title}</h3>
          <p className="text-xs sm:text-sm text-[#94A3B8]">{statusInfo.description}</p>
        </div>
      </div>
      
      {stationName && slotId && (
        <div className="mt-3 sm:mt-4 p-3 rounded-lg bg-[#334155]/30 border border-[#475569]/50">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-[#94A3B8]">Station</span>
            <span className="text-[#F1F5F9] font-medium">{stationName}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm mt-1">
            <span className="text-[#94A3B8]">Slot ID</span>
            <span className="text-[#F1F5F9] font-medium">#{slotId}</span>
          </div>
        </div>
      )}
      
      {startTime && (
        <div className="mt-3 sm:mt-4 p-3 rounded-lg bg-[#334155]/30 border border-[#475569]/50">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-[#94A3B8]">Start Time</span>
            <span className="text-[#F1F5F9] font-medium">
              {new Date(startTime).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          {endTime && (
            <div className="flex justify-between text-xs sm:text-sm mt-1">
              <span className="text-[#94A3B8]">End Time</span>
              <span className="text-[#F1F5F9] font-medium">
                {new Date(endTime).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};