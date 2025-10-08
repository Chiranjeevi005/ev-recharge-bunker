"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface Slot {
  slotId: string;
  status: "available" | "occupied" | "maintenance";
  chargerType: string;
  pricePerHour: number;
}

interface SlotAvailabilityCardProps {
  stationName: string;
  slots: Slot[];
  loading?: boolean;
  onBookSlot?: (slotId: string) => void;
}

export const SlotAvailabilityCard: React.FC<SlotAvailabilityCardProps> = ({ 
  stationName,
  slots = [],
  loading = false,
  onBookSlot
}) => {
  const getStatusInfo = (status: Slot['status']) => {
    switch (status) {
      case 'available':
        return {
          text: 'Available',
          color: 'bg-green-500/20 text-green-400',
          icon: (
            <svg className="w-2 xs:w-3 sm:w-4 h-2 xs:h-3 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          )
        };
      case 'occupied':
        return {
          text: 'Occupied',
          color: 'bg-red-500/20 text-red-400',
          icon: (
            <svg className="w-2 xs:w-3 sm:w-4 h-2 xs:h-3 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          )
        };
      case 'maintenance':
        return {
          text: 'Maintenance',
          color: 'bg-yellow-500/20 text-yellow-400',
          icon: (
            <svg className="w-2 xs:w-3 sm:w-4 h-2 xs:h-3 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          )
        };
      default:
        return {
          text: 'Unknown',
          color: 'bg-gray-500/20 text-gray-400',
          icon: (
            <svg className="w-2 xs:w-3 sm:w-4 h-2 xs:h-3 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          )
        };
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-[#1E293B]/80 border border-[#334155] p-2 xs:p-3 sm:p-4 md:p-5">
        <div className="flex flex-col items-center justify-center py-3 xs:py-4 sm:py-5">
          <LoadingSpinner size="md" className="mb-2 xs:mb-3" />
          <p className="text-[#94A3B8] text-[10px] xs:text-xs">Loading slot availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#1E293B]/80 border border-[#334155] p-2 xs:p-3 sm:p-4 md:p-5">
      <h2 className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-bold text-[#F1F5F9] mb-1.5 xs:mb-2 sm:mb-3">Slot Availability</h2>
      <p className="text-[#94A3B8] text-[10px] xs:text-xs sm:text-sm mb-2 xs:mb-3">Station: {stationName}</p>
      
      {slots.length === 0 ? (
        <div className="text-center py-3 xs:py-4 sm:py-5">
          <div className="inline-block p-1.5 xs:p-2 sm:p-3 rounded-full bg-[#334155]/50 mb-1.5 xs:mb-2">
            <svg className="w-5 xs:w-6 sm:w-8 h-5 xs:h-6 sm:h-8 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </div>
          <p className="text-[#94A3B8] text-xs xs:text-sm">No slots available</p>
        </div>
      ) : (
        <div className="space-y-1.5 xs:space-y-2 sm:space-y-3">
          {slots.map((slot) => {
            const statusInfo = getStatusInfo(slot.status);
            return (
              <motion.div
                key={slot.slotId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-1.5 xs:p-2 sm:p-3 rounded-xl bg-[#334155]/30 border border-[#475569]/50"
              >
                <div className="flex items-center">
                  <div className="p-1 xs:p-1.5 sm:p-2 rounded-lg bg-[#8B5CF6]/20 mr-1.5 xs:mr-2 sm:mr-3">
                    <svg className="w-3 xs:w-4 sm:w-5 h-3 xs:h-4 sm:h-5 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-[#F1F5F9] text-[10px] xs:text-xs sm:text-sm">Slot #{slot.slotId.slice(-4)}</h3>
                    <p className="text-[8px] xs:text-[10px] sm:text-xs text-[#94A3B8]">{slot.chargerType} • ₹{slot.pricePerHour}/hr</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 xs:space-x-1.5 sm:space-x-2">
                  <div className={`flex items-center px-1 xs:px-1.5 sm:px-2 py-0.5 text-[8px] xs:text-[10px] sm:text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.icon}
                    <span className="ml-0.5 xs:ml-1">{statusInfo.text}</span>
                  </div>
                  
                  {slot.status === 'available' && onBookSlot && (
                    <button
                      onClick={() => onBookSlot(slot.slotId)}
                      className="px-1.5 xs:px-2 sm:px-2.5 py-0.5 xs:py-1 text-[8px] xs:text-[10px] sm:text-xs bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED] transition-colors"
                    >
                      Book
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};