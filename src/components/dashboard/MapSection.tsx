"use client";

import React, { useState, useEffect } from 'react';
import { FuturisticMap } from '@/components/landing/FuturisticMap';
import { useSession } from 'next-auth/react';

interface MapSectionProps {
  onBookPay: () => void;
}

export const MapSection: React.FC<MapSectionProps> = ({ onBookPay }) => {
  const { data: session } = useSession();
  const [refreshKey, setRefreshKey] = useState(0);
  const [location, setLocation] = useState<string | null>(null);

  console.log('MapSection: Rendering with session:', session);
  console.log('MapSection: userId:', session?.user?.id);

  // Listen for profile updates
  useEffect(() => {
    console.log('MapSection: Setting up event listeners');
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userProfile') {
        // Trigger a refresh of the map when profile is updated
        console.log('MapSection: Storage event received, refreshing map', e.newValue);
        try {
          const profile = JSON.parse(e.newValue || '{}');
          setLocation(profile.location || null);
        } catch (err) {
          console.error('MapSection: Error parsing profile data', err);
        }
        setRefreshKey(prev => prev + 1);
      }
    };

    const handleLocationUpdate = (e: CustomEvent) => {
      console.log('MapSection: Custom location update event received, refreshing map', e.detail);
      if (e.detail && e.detail.location) {
        setLocation(e.detail.location);
      }
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('locationUpdated', handleLocationUpdate as EventListener);
    
    console.log('MapSection: Event listeners added');
    
    // Also check localStorage on initial load
    try {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setLocation(profile.location || null);
        console.log('MapSection: Loaded location from localStorage:', profile.location);
      }
    } catch (err) {
      console.error('MapSection: Error loading profile from localStorage', err);
    }
    
    return () => {
      console.log('MapSection: Cleaning up event listeners');
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('locationUpdated', handleLocationUpdate as EventListener);
    };
  }, []);

  return (
    <div className="rounded-2xl p-6 shadow-lg border border-[#475569]/50 relative overflow-hidden bg-[#1E293B]/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#F1F5F9]">Charging Stations Near You</h2>
        <button 
          onClick={onBookPay}
          className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
        >
          View All Stations
        </button>
      </div>
      <div className="px-4 py-6 h-[450px]">
        <FuturisticMap 
          {...(session?.user?.id && { userId: session.user.id })}
          location={location}
          refreshKey={refreshKey} 
        />
      </div>
    </div>
  );
};