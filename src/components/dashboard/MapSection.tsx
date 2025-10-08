"use client";

import React, { useState, useEffect } from 'react';
import { FuturisticMap } from '@/components/landing/FuturisticMap';
import { useSession } from 'next-auth/react';
import { useLoader } from '@/context/LoaderContext';

// City name mapping from dropdown values to database values
const CITY_NAME_MAPPING: Record<string, string> = {
  "Bangalore": "Bengaluru",
  "Hyderabad": "Hyderabad",
  "Chennai": "Chennai",
  "Delhi": "Delhi",
  "Mumbai": "Mumbai",
  "Kolkata": "Kolkata",
  "Pune": "Pune",
  "Ahmedabad": "Ahmedabad"
};

interface MapSectionProps {
  onBookPay: () => void;
}

export const MapSection: React.FC<MapSectionProps> = React.memo(({ onBookPay }) => {
  const { data: session } = useSession();
  
  // Set display name for the component
  MapSection.displayName = 'MapSection';
  const [refreshKey, setRefreshKey] = useState(0);
  const [location, setLocation] = useState<string | null>(null);
  const { showLoader, hideLoader } = useLoader();

  // Listen for profile updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userProfile') {
        // Trigger a refresh of the map when profile is updated
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
      if (e.detail && e.detail.location) {
        setLocation(e.detail.location);
      }
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('locationUpdated', handleLocationUpdate as EventListener);
    
    // Also check localStorage on initial load
    try {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setLocation(profile.location || null);
      }
    } catch (err) {
      console.error('MapSection: Error loading profile from localStorage', err);
    }
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('locationUpdated', handleLocationUpdate as EventListener);
    };
  }, []);

  return (
    <div className="rounded-2xl p-4 sm:p-6 shadow-lg border border-[#475569]/50 relative overflow-hidden bg-[#1E293B]/50">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#F1F5F9]">Charging Stations Near You</h2>
        <button 
          onClick={onBookPay}
          className="px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base"
        >
          View All Stations
        </button>
      </div>
      <div className="px-2 sm:px-4 py-4 sm:py-6 h-[300px] sm:h-[400px] md:h-[450px]">
        <FuturisticMap 
          userId={session?.user?.id}
          location={location ? CITY_NAME_MAPPING[location] || location : null}
          refreshKey={refreshKey}
        />
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if onBookPay function reference changes
  return prevProps.onBookPay === nextProps.onBookPay;
});