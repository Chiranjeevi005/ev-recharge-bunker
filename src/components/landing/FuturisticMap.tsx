"use client";

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface ChargingStation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  slots: {
    slotId: string;
    status: "available" | "occupied" | "maintenance";
    chargerType: string;
    pricePerHour: number;
  }[];
}

export const FuturisticMap: React.FC<{ userId?: string; refreshKey?: number }> = ({ userId, refreshKey = 0 }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [chargingStations, setChargingStations] = useState<ChargingStation[]>([]);
  const markerRefs = useRef<maplibregl.Marker[]>([]);

  console.log('FuturisticMap: Component rendered with userId:', userId, 'refreshKey:', refreshKey);

  // Fetch charging stations based on user ID
  useEffect(() => {
    console.log('FuturisticMap: useEffect triggered with userId:', userId, 'refreshKey:', refreshKey);
    
    const fetchStations = async () => {
      try {
        if (!userId) {
          // Fallback to default stations for Delhi if no user ID
          console.log('FuturisticMap: No userId, using default Delhi stations');
          setChargingStations([
            {
              id: '1',
              name: 'Delhi Metro Station',
              address: 'Central Delhi, Delhi',
              lat: 28.6328,
              lng: 77.2194,
              slots: [
                { slotId: '1', status: 'available', chargerType: 'AC Type 2', pricePerHour: 50 },
                { slotId: '2', status: 'available', chargerType: 'DC CCS', pricePerHour: 70 },
                { slotId: '3', status: 'occupied', chargerType: 'DC CHAdeMO', pricePerHour: 60 },
              ]
            },
            {
              id: '2',
              name: 'Delhi Central Hub',
              address: 'Downtown Delhi, Delhi',
              lat: 28.6139,
              lng: 77.2090,
              slots: [
                { slotId: '1', status: 'available', chargerType: 'AC Type 1', pricePerHour: 45 },
                { slotId: '2', status: 'available', chargerType: 'DC CCS', pricePerHour: 75 },
                { slotId: '3', status: 'maintenance', chargerType: 'AC Type 2', pricePerHour: 50 },
              ]
            }
          ]);
          return;
        }
        
        console.log('FuturisticMap: Fetching stations for userId:', userId);
        const response = await fetch(`/api/dashboard/stations?userId=${encodeURIComponent(userId)}`);
        console.log('FuturisticMap: API response status:', response.status);
        
        if (response.ok) {
          const stations = await response.json();
          console.log('FuturisticMap: Received stations:', stations);
          setChargingStations(stations);
        } else {
          const errorText = await response.text();
          console.log('FuturisticMap: API failed with status:', response.status, 'error:', errorText);
          // Fallback to default stations for Delhi if API fails
          setChargingStations([
            {
              id: '1',
              name: 'Delhi Metro Station',
              address: 'Central Delhi, Delhi',
              lat: 28.6328,
              lng: 77.2194,
              slots: [
                { slotId: '1', status: 'available', chargerType: 'AC Type 2', pricePerHour: 50 },
                { slotId: '2', status: 'available', chargerType: 'DC CCS', pricePerHour: 70 },
                { slotId: '3', status: 'occupied', chargerType: 'DC CHAdeMO', pricePerHour: 60 },
              ]
            },
            {
              id: '2',
              name: 'Delhi Central Hub',
              address: 'Downtown Delhi, Delhi',
              lat: 28.6139,
              lng: 77.2090,
              slots: [
                { slotId: '1', status: 'available', chargerType: 'AC Type 1', pricePerHour: 45 },
                { slotId: '2', status: 'available', chargerType: 'DC CCS', pricePerHour: 75 },
                { slotId: '3', status: 'maintenance', chargerType: 'AC Type 2', pricePerHour: 50 },
              ]
            }
          ]);
        }
      } catch (error) {
        console.error("Error fetching stations:", error);
        // Fallback to default stations for Delhi if API fails
        setChargingStations([
          {
            id: '1',
            name: 'Delhi Metro Station',
            address: 'Central Delhi, Delhi',
            lat: 28.6328,
            lng: 77.2194,
            slots: [
              { slotId: '1', status: 'available', chargerType: 'AC Type 2', pricePerHour: 50 },
              { slotId: '2', status: 'available', chargerType: 'DC CCS', pricePerHour: 70 },
              { slotId: '3', status: 'occupied', chargerType: 'DC CHAdeMO', pricePerHour: 60 },
            ]
          },
          {
            id: '2',
            name: 'Delhi Central Hub',
            address: 'Downtown Delhi, Delhi',
            lat: 28.6139,
            lng: 77.2090,
            slots: [
              { slotId: '1', status: 'available', chargerType: 'AC Type 1', pricePerHour: 45 },
              { slotId: '2', status: 'available', chargerType: 'DC CCS', pricePerHour: 75 },
              { slotId: '3', status: 'maintenance', chargerType: 'AC Type 2', pricePerHour: 50 },
            ]
          }
        ]);
      }
    };

    fetchStations();
  }, [userId, refreshKey]);

  // Initialize the map and update markers when stations change
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Add a small delay to ensure container is properly rendered
    const initTimer = setTimeout(() => {
      // Check if container has dimensions
      const container = mapContainerRef.current!;
      const offsetWidth = container.offsetWidth;
      const offsetHeight = container.offsetHeight;
      
      console.log('FuturisticMap: Container dimensions:', offsetWidth, 'x', offsetHeight);
      
      if (offsetWidth === 0 || offsetHeight === 0) {
        console.warn('FuturisticMap: Container has zero dimensions, map initialization delayed');
        // The parent component should handle retries through refreshKey
        return;
      }

      // Clean up any existing map instance
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // Create map instance with center based on stations or default to Delhi
      const defaultCenter: [number, number] = chargingStations.length > 0 
        ? [chargingStations[0].lng, chargingStations[0].lat] 
        : [77.2090, 28.6139];
      
      const defaultZoom = chargingStations.length > 0 ? 10 : 12;

      const map = new maplibregl.Map({
        container: container,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: defaultCenter,
        zoom: defaultZoom,
        attributionControl: false
      });

      mapRef.current = map;

      // Add navigation controls
      map.addControl(new maplibregl.NavigationControl(), 'top-right');

      // Handle map resize
      const handleResize = () => {
        if (mapRef.current) {
          mapRef.current.resize();
          console.log('FuturisticMap: Map resized');
        }
      };

      // Add resize listener
      window.addEventListener('resize', handleResize);

      // Add markers for each station
      const updateMarkers = () => {
        // Remove existing markers
        markerRefs.current.forEach(marker => marker.remove());
        markerRefs.current = [];

        // Add markers for each station
        chargingStations.forEach(station => {
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
            setSelectedStation(station);
          });
          
          if (mapRef.current) {
            const marker = new maplibregl.Marker({
              element: el,
              anchor: 'center'
            })
              .setLngLat([station.lng, station.lat])
              .addTo(mapRef.current);
            
            markerRefs.current.push(marker);
          }
        });

        // Fit map to show all stations
        if (chargingStations.length > 0 && mapRef.current) {
          const bounds = new maplibregl.LngLatBounds();
          
          chargingStations.forEach(station => {
            bounds.extend([station.lng, station.lat]);
          });
          
          mapRef.current.fitBounds(bounds, {
            padding: 50,
            maxZoom: 15
          });
        }
      };

      // Update markers when map loads
      map.on('load', () => {
        console.log('FuturisticMap: Map loaded, updating markers');
        updateMarkers();
      });

      // Clean up on unmount
      return () => {
        window.removeEventListener('resize', handleResize);
        if (mapRef.current) {
          // Remove all markers
          markerRefs.current.forEach(marker => marker.remove());
          markerRefs.current = [];
          // Remove map
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }, 100); // Small delay to ensure proper rendering

    return () => clearTimeout(initTimer);
  }, [chargingStations, refreshKey]);

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
    <div className="map-container rounded-xl overflow-hidden border border-[#475569]">
      {/* Map container */}
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Station info panel */}
      {selectedStation && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-80 bg-[#1E293B] border border-[#475569] rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-[#F1F5F9]">{selectedStation.name}</h3>
              <p className="text-sm text-[#94A3B8]">{selectedStation.address}</p>
            </div>
            <button 
              onClick={() => setSelectedStation(null)}
              className="text-[#94A3B8] hover:text-[#F1F5F9]"
            >
              ✕
            </button>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-[#94A3B8]">Available Slots</p>
              <p className="text-lg font-bold text-[#10B981]">
                {selectedStation.slots.filter(slot => slot.status === 'available').length}/{selectedStation.slots.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#94A3B8]">Pricing</p>
              <p className="text-lg font-bold text-[#F1F5F9]">
                ₹{Math.min(...selectedStation.slots.map(slot => slot.pricePerHour))}/hr
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <button className="w-full py-2 px-4 bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white rounded-lg hover:opacity-90 transition-opacity">
              Book Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};