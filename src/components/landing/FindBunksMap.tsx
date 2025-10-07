"use client";

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Station {
  _id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  city: string;
  slots: {
    slotId: string;
    status: "available" | "occupied" | "maintenance";
    chargerType: string;
    pricePerHour: number;
  }[];
}

// Helper function to validate coordinates
const isValidCoordinate = (value: any): boolean => {
  // Check if value is null or undefined
  if (value === null || value === undefined) return false;
  
  // Convert to number if it's a string
  const num = typeof value === 'number' ? value : parseFloat(value);
  
  // Check if it's a finite number and within valid coordinate ranges
  return isFinite(num) && Math.abs(num) <= 180; // 180 for longitude, 90 for latitude but we'll check that separately
};

// Helper function to parse coordinates safely
const parseCoordinate = (value: any): number | null => {
  if (value === null || value === undefined) return null;
  const num = typeof value === 'number' ? value : parseFloat(value);
  return isFinite(num) ? num : null;
};

// Enhanced function to validate both latitude and longitude
const isValidLatLng = (lat: any, lng: any): boolean => {
  const parsedLat = parseCoordinate(lat);
  const parsedLng = parseCoordinate(lng);
  
  // Both must be valid numbers
  if (parsedLat === null || parsedLng === null) return false;
  
  // Check ranges: latitude [-90, 90], longitude [-180, 180]
  return Math.abs(parsedLat) <= 90 && Math.abs(parsedLng) <= 180;
};

interface FindBunksMapProps {
  stations: Station[];
  onStationSelect: (station: Station) => void;
  selectedStation: Station | null;
}

export const FindBunksMap: React.FC<FindBunksMapProps> = ({ 
  stations: stationsProp, 
  onStationSelect,
  selectedStation
}) => {
  // Ensure stations is always an array
  const stations = Array.isArray(stationsProp) ? stationsProp : [];
  
  // Type guard for the first station
  const firstStation = stations.length > 0 ? stations[0] : null;
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Initialize the map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create map instance
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: firstStation && isValidLatLng(firstStation.lat, firstStation.lng) ? [firstStation.lng, firstStation.lat] : [77.209021, 28.613939],
      zoom: stations.length > 0 ? 10 : 12,
      attributionControl: false
    });

    mapRef.current = map;

    // Add navigation controls
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Clean up on unmount
    return () => {
      // Remove all markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      
      // Remove map
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  // Update markers when stations change
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each station
    stations.forEach(station => {
      // Validate coordinates before creating marker
      if (!isValidLatLng(station.lat, station.lng)) {
        console.warn('FindBunksMap: Skipping station with invalid coordinates:', station);
        return;
      }
      
      const el = document.createElement('div');
      el.className = 'station-marker';
      
      // Count available slots
      const availableSlots = station.slots.filter(slot => slot.status === "available").length;
      
      el.innerHTML = `
        <div class="relative">
          <div class="w-6 h-6 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] border-2 border-white flex items-center justify-center shadow-lg cursor-pointer">
            <span class="text-white text-xs font-bold">⚡</span>
          </div>
          <div class="absolute -top-2 -right-2 bg-[#10B981] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            ${availableSlots}
          </div>
        </div>
      `;
      
      // Add click event to marker
      el.addEventListener('click', () => {
        onStationSelect(station);
      });
      
      if (mapRef.current) {
        try {
          const marker = new maplibregl.Marker({
            element: el,
            anchor: 'center'
          })
            .setLngLat([station.lng, station.lat])
            .addTo(mapRef.current);
          
          markersRef.current.push(marker);
        } catch (error) {
          console.error('FindBunksMap: Error creating marker for station:', station, error);
        }
      }
    });

    // Fit map to show all stations
    if (stations.length > 0 && mapRef.current) {
      try {
        const bounds = new maplibregl.LngLatBounds();
        let validStationCount = 0;
        
        stations.forEach(station => {
          // Validate coordinates before extending bounds
          if (!isValidLatLng(station.lat, station.lng)) {
            return;
          }
          
          try {
            bounds.extend([station.lng, station.lat]);
            validStationCount++;
          } catch (error) {
            console.warn('FindBunksMap: Error extending bounds for station:', station, error);
          }
        });
        
        // Only fit bounds if we have valid stations
        if (validStationCount > 0 && !bounds.isEmpty()) {
          mapRef.current.fitBounds(bounds, {
            padding: 50,
            maxZoom: 15
          });
        } else {
          console.warn('FindBunksMap: No valid stations to fit bounds');
        }
      } catch (error) {
        console.error('FindBunksMap: Error fitting bounds:', error);
      }
    }
  }, [stations, onStationSelect]);

  // Highlight selected station
  useEffect(() => {
    if (!mapRef.current || !selectedStation) return;
    
    // Validate coordinates before flying to station
    if (!isValidLatLng(selectedStation.lat, selectedStation.lng)) {
      console.warn('FindBunksMap: Skipping selected station with invalid coordinates:', selectedStation);
      return;
    }
    
    // Fly to selected station
    mapRef.current.flyTo({
      center: [selectedStation.lng, selectedStation.lat],
      zoom: 14,
      essential: true
    });
  }, [selectedStation]);

  return (
    <div ref={mapContainerRef} className="w-full h-full rounded-xl overflow-hidden" />
  );
};