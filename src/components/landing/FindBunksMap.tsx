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

interface FindBunksMapProps {
  stations: Station[];
  onStationSelect: (station: Station) => void;
  selectedStation: Station | null;
}

export const FindBunksMap: React.FC<FindBunksMapProps> = ({ 
  stations, 
  onStationSelect,
  selectedStation
}) => {
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
      center: stations.length > 0 ? [stations[0].lng, stations[0].lat] : [77.209021, 28.613939],
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
      const el = document.createElement('div');
      el.className = 'station-marker';
      
      // Count available slots
      const availableSlots = station.slots.filter(slot => slot.status === "available").length;
      
      el.innerHTML = `
        <div class="relative">
          <div class="w-6 h-6 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] border-2 border-white flex items-center justify-center shadow-lg">
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
        const marker = new maplibregl.Marker({
          element: el,
          anchor: 'center'
        })
          .setLngLat([station.lng, station.lat])
          .addTo(mapRef.current);
        
        markersRef.current.push(marker);
      }
    });

    // Fit map to show all stations
    if (stations.length > 0 && mapRef.current) {
      const bounds = new maplibregl.LngLatBounds();
      
      stations.forEach(station => {
        bounds.extend([station.lng, station.lat]);
      });
      
      mapRef.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
  }, [stations, onStationSelect]);

  // Highlight selected station
  useEffect(() => {
    if (!mapRef.current || !selectedStation) return;
    
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