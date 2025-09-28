"use client";

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion } from 'framer-motion';

// Import MapLibre Geocoder
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
import type { MaplibreGeocoderApi, MaplibreGeocoderApiConfig, MaplibreGeocoderFeatureResults, CarmenGeojsonFeature } from '@maplibre/maplibre-gl-geocoder';

interface Slot {
  slotId: string;
  status: "available" | "occupied" | "maintenance";
  chargerType: string;
  pricePerHour: number;
}

interface ChargingStation {
  _id: string;
  city: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  slots: Slot[];
}

interface BookingData {
  stationId: string;
  slotId: string;
  bunkName: string;
  amount: number;
}

export const BunkFinderMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [mapStyle, setMapStyle] = useState<'liberty' | 'positron' | 'bright'>('liberty');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [chargingStations, setChargingStations] = useState<ChargingStation[]>([]);
  const [filters, setFilters] = useState({
    availableOnly: false,
    maxPrice: 100
  });
  const [isBookingPanelOpen, setIsBookingPanelOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  // Load charging stations
  useEffect(() => {
    const loadStations = async () => {
      try {
        const response = await fetch('/api/stations');
        const stations = await response.json();
        setChargingStations(stations);
      } catch (error) {
        console.error('Failed to load charging stations:', error);
        // Fallback to sample data
        setChargingStations([
          {
            _id: "1",
            city: "Delhi",
            name: "Delhi Metro Station",
            address: "Rajiv Chowk, New Delhi",
            lat: 28.6328,
            lng: 77.2194,
            slots: [
              { slotId: "delhi-1-1", status: "available", chargerType: "AC Type 2", pricePerHour: 50 },
              { slotId: "delhi-1-2", status: "available", chargerType: "DC CHAdeMO", pricePerHour: 60 },
              { slotId: "delhi-1-3", status: "occupied", chargerType: "DC CCS", pricePerHour: 70 },
              { slotId: "delhi-1-4", status: "available", chargerType: "AC Type 1", pricePerHour: 45 },
            ]
          },
          {
            _id: "2",
            city: "Mumbai",
            name: "Mumbai Central Station",
            address: "Mumbai Central, Mumbai",
            lat: 18.9693,
            lng: 72.8202,
            slots: [
              { slotId: "mumbai-1-1", status: "available", chargerType: "AC Type 2", pricePerHour: 55 },
              { slotId: "mumbai-1-2", status: "available", chargerType: "DC CCS", pricePerHour: 75 },
              { slotId: "mumbai-1-3", status: "occupied", chargerType: "DC CHAdeMO", pricePerHour: 65 },
            ]
          }
        ]);
      }
    };

    loadStations();
  }, []);

  // Toggle favorite status for a station
  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(favId => favId !== id) 
        : [...prev, id]
    );
  };

  // Filter stations based on filters
  const filteredStations = chargingStations.filter(station => {
    if (filters.availableOnly && station.slots.filter(s => s.status === "available").length === 0) return false;
    
    // Find the minimum price among available slots
    const availableSlots = station.slots.filter(s => s.status === "available");
    if (availableSlots.length > 0) {
      const minPrice = Math.min(...availableSlots.map(s => s.pricePerHour));
      if (minPrice > filters.maxPrice) return false;
    }
    
    return true;
  });

  // Initialize the map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create map instance
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [77.209021, 28.613939], // New Delhi coordinates
      zoom: 12,
      attributionControl: false
    });

    mapRef.current = map;

    // Add geolocate control (without default UI)
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }),
      'top-right'
    );

    // Add geocoder control with proper typing
    const geocoderApi: MaplibreGeocoderApi = {
      forwardGeocode: async (config: MaplibreGeocoderApiConfig): Promise<MaplibreGeocoderFeatureResults> => {
        const features: CarmenGeojsonFeature[] = [];
        try {
          // Ensure we have a query string
          if (typeof config.query !== 'string') {
            return { features: [], type: 'FeatureCollection' };
          }
          
          const request = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(config.query)}&format=geojson&polygon_geojson=1&addressdetails=1`;
          const response = await fetch(request);
          const geojson = await response.json();
          
          for (const feature of geojson.features) {
            const center = [
              feature.bbox[0] + (feature.bbox[2] - feature.bbox[0]) / 2,
              feature.bbox[1] + (feature.bbox[3] - feature.bbox[1]) / 2
            ];
            const point: CarmenGeojsonFeature = {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: center
              },
              place_name: feature.properties.display_name,
              properties: feature.properties,
              text: feature.properties.display_name,
              place_type: ['place'],
              id: feature.id,
              bbox: feature.bbox
            };
            features.push(point);
          }
        } catch (e) {
          console.error(`Failed to forwardGeocode: ${e}`);
        }
        return {
          features,
          type: 'FeatureCollection'
        };
      }
    };

    const geocoder = new MaplibreGeocoder(geocoderApi, {
      maplibregl: maplibregl,
      collapsed: true,
      placeholder: 'Search for places...'
    });
    
    map.addControl(geocoder, 'top-left');

    // Add route line (simulated)
    map.on('load', () => {
      map.addSource('route', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': [
              [77.209021, 28.613939],
              [77.211000, 28.589700],
              [77.219400, 28.632800]
            ]
          }
        },
        'lineMetrics': true // Enable lineMetrics for gradient rendering
      });
      
      map.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'route',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': ['interpolate', ['linear'], ['line-progress'], 0, '#00ffff', 1, '#8B5CF6'],
          'line-width': 4,
          'line-gradient': ['interpolate', ['linear'], ['line-progress'], 0, '#00ffff', 1, '#8B5CF6']
        }
      });
    });

    // Clean up on unmount
    return () => {
      map.remove();
    };
  }, []);

  // Update markers when stations or filters change
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;

    // Clear existing markers
    const markers = document.querySelectorAll('.station-marker-container');
    markers.forEach(marker => marker.remove());

    // Add custom markers for charging stations
    filteredStations.forEach(station => {
      // Remove existing marker for this station
      const existingMarker = document.querySelector(`.station-marker-${station._id}`);
      if (existingMarker) {
        existingMarker.remove();
      }

      // Count available slots
      const availableSlots = station.slots.filter(s => s.status === "available").length;
      const hasAvailableSlots = availableSlots > 0;

      const el = document.createElement('div');
      el.className = `station-marker-container station-marker-${station._id}`;
      el.innerHTML = `
        <div class="${favorites.includes(station._id) ? 'favorite-marker' : hasAvailableSlots ? 'station-marker available' : 'station-marker unavailable'}">
          ⚡
        </div>
      `;
      
      // Add click event to marker
      el.addEventListener('click', () => {
        setSelectedStation(station);
      });
      
      new maplibregl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat([station.lng, station.lat])
        .addTo(mapRef.current!);
    });
  }, [filteredStations, favorites]);

  // Change map style
  const changeMapStyle = (style: 'liberty' | 'positron' | 'bright') => {
    if (!mapRef.current) return;
    
    setMapStyle(style);
    
    switch (style) {
      case 'liberty':
        mapRef.current.setStyle('https://tiles.openfreemap.org/styles/liberty');
        break;
      case 'positron':
        mapRef.current.setStyle('https://tiles.openfreemap.org/styles/positron');
        break;
      case 'bright':
        mapRef.current.setStyle('https://tiles.openfreemap.org/styles/bright');
        break;
    }
  };

  // Handle booking
  const handleBookSlot = async () => {
    if (!selectedStation || !selectedSlot) return;
    
    setIsLoading(true);
    
    try {
      // Simulate booking process
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stationId: selectedStation._id,
          slotId: selectedSlot
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update local state to reflect booked slot
        setChargingStations(prev => 
          prev.map(station => 
            station._id === selectedStation._id 
              ? { 
                  ...station, 
                  slots: station.slots.map(slot => 
                    slot.slotId === selectedSlot 
                      ? { ...slot, status: "occupied" } 
                      : slot
                  )
                } 
              : station
          )
        );
        
        // Set booking data for confirmation
        setBookingData({
          stationId: selectedStation._id,
          slotId: selectedSlot,
          bunkName: selectedStation.name,
          amount: 250 // This would be calculated based on pricing and duration
        });
        
        // Close booking panel and show confirmation
        setIsBookingPanelOpen(false);
        setSelectedSlot('');
        
        // Show success message
        alert(`Booking confirmed for ${selectedStation.name} - Slot ${selectedSlot}`);
      } else {
        alert(`Booking failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to process booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      availableOnly: false,
      maxPrice: 100
    });
  };

  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden border border-[#475569] shadow-xl shadow-[#8B5CF6]/10">
      {/* Map container */}
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Custom map controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
        <button 
          className="neon-button"
          onClick={() => mapRef.current?.zoomIn()}
        >
          +
        </button>
        <button 
          className="neon-button"
          onClick={() => mapRef.current?.zoomOut()}
        >
          -
        </button>
        <button 
          className="neon-button"
          onClick={() => mapRef.current?.flyTo({ center: [77.209021, 28.613939], zoom: 12 })}
        >
          Ⓧ
        </button>
      </div>
      
      {/* Layer control */}
      <div className="absolute top-4 left-4 z-10 bg-[#1E293B]/80 backdrop-blur-sm rounded-lg p-2 border border-[#475569]">
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 text-xs rounded-md ${
              mapStyle === 'liberty' 
                ? 'bg-[#8B5CF6] text-white' 
                : 'bg-[#334155] text-[#CBD5E1] hover:bg-[#475569]'
            }`}
            onClick={() => changeMapStyle('liberty')}
          >
            Liberty
          </button>
          <button 
            className={`px-3 py-1 text-xs rounded-md ${
              mapStyle === 'positron' 
                ? 'bg-[#8B5CF6] text-white' 
                : 'bg-[#334155] text-[#CBD5E1] hover:bg-[#475569]'
            }`}
            onClick={() => changeMapStyle('positron')}
          >
            Positron
          </button>
          <button 
            className={`px-3 py-1 text-xs rounded-md ${
              mapStyle === 'bright' 
                ? 'bg-[#8B5CF6] text-white' 
                : 'bg-[#334155] text-[#CBD5E1] hover:bg-[#475569]'
            }`}
            onClick={() => changeMapStyle('bright')}
          >
            Bright
          </button>
        </div>
      </div>
      
      {/* Filters panel */}
      <div className="absolute top-16 left-4 z-10 bg-[#1E293B]/80 backdrop-blur-sm rounded-lg p-3 border border-[#475569] w-64">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-white">Filters</h3>
          <button 
            onClick={resetFilters}
            className="text-xs text-[#8B5CF6] hover:text-[#A78BFA]"
          >
            Reset
          </button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="available" 
              className="mr-2 h-4 w-4 rounded border-[#475569] bg-[#334155] text-[#8B5CF6] focus:ring-[#8B5CF6]"
              checked={filters.availableOnly}
              onChange={(e) => setFilters({...filters, availableOnly: e.target.checked})}
            />
            <label htmlFor="available" className="text-xs text-[#CBD5E1]">Available Only</label>
          </div>
          <div>
            <label className="block text-xs text-[#CBD5E1] mb-1">Max Price (₹/hour)</label>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: parseInt(e.target.value)})}
              className="w-full h-1 bg-[#334155] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#8B5CF6]"
            />
            <div className="text-xs text-[#94A3B8] text-right">{filters.maxPrice}</div>
          </div>
        </div>
      </div>
      
      {/* Station info panel */}
      {selectedStation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-80 bg-[#1E293B] border border-[#475569] rounded-xl p-4 shadow-lg z-10"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-[#F1F5F9]">{selectedStation.name}</h3>
              <p className="text-sm text-[#94A3B8]">{selectedStation.address}, {selectedStation.city}</p>
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
                {selectedStation.slots.filter(s => s.status === "available").length}/{selectedStation.slots.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#94A3B8]">Min Price</p>
              <p className="text-lg font-bold text-[#F1F5F9]">
                ₹{Math.min(...selectedStation.slots.filter(s => s.status === "available").map(s => s.pricePerHour), 0)}/hr
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex space-x-2">
            <button 
              className="flex-1 py-2 px-4 bg-[#334155] hover:bg-[#475569] text-[#F1F5F9] rounded-lg transition-colors"
              onClick={() => toggleFavorite(selectedStation._id)}
            >
              {favorites.includes(selectedStation._id) ? '★ Favorited' : '☆ Favorite'}
            </button>
            <button 
              className={`flex-1 py-2 px-4 rounded-lg transition-opacity ${
                selectedStation.slots.filter(s => s.status === "available").length > 0
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white hover:opacity-90'
                  : 'bg-[#94A3B8] text-[#1E293B] cursor-not-allowed'
              }`}
              onClick={() => {
                if (selectedStation.slots.filter(s => s.status === "available").length > 0) {
                  setIsBookingPanelOpen(true);
                }
              }}
              disabled={selectedStation.slots.filter(s => s.status === "available").length === 0}
            >
              {selectedStation.slots.filter(s => s.status === "available").length > 0 ? 'Book Slot' : 'No Slots'}
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Booking panel */}
      {isBookingPanelOpen && selectedStation && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsBookingPanelOpen(false)}
        >
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div 
                className="absolute inset-0 bg-[#0F172A]/80"
                onClick={() => setIsBookingPanelOpen(false)}
              ></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <motion.div
              className="inline-block align-bottom bg-[#1E293B] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-[#334155] w-full max-w-md mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-3 sm:px-6 sm:py-5 border-b border-[#334155] flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-white">Book Slot at {selectedStation.name}</h3>
                <button 
                  onClick={() => setIsBookingPanelOpen(false)}
                  className="text-[#94A3B8] hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#F1F5F9] mb-2">Select Slot</label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-[#334155] border border-[#475569] rounded-lg text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                  >
                    <option value="">Choose a slot</option>
                    {selectedStation.slots
                      .filter(slot => slot.status === "available")
                      .map(slot => (
                        <option key={slot.slotId} value={slot.slotId}>
                          {slot.chargerType} - ₹{slot.pricePerHour}/hr
                        </option>
                      ))}
                  </select>
                </div>
                
                {selectedSlot && (
                  <div className="bg-[#334155]/50 rounded-lg p-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-[#94A3B8]">Charger Type:</span>
                      <span className="text-[#F1F5F9]">
                        {selectedStation.slots.find(s => s.slotId === selectedSlot)?.chargerType}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-[#94A3B8]">Price per hour:</span>
                      <span className="text-[#F1F5F9]">
                        ₹{selectedStation.slots.find(s => s.slotId === selectedSlot)?.pricePerHour}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#94A3B8]">Estimated Duration:</span>
                      <span className="text-[#F1F5F9]">1 hour</span>
                    </div>
                    <div className="border-t border-[#475569] pt-2 mt-2">
                      <div className="flex justify-between font-bold">
                        <span className="text-[#F1F5F9]">Total:</span>
                        <span className="text-[#10B981]">₹{selectedStation.slots.find(s => s.slotId === selectedSlot)?.pricePerHour}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsBookingPanelOpen(false)}
                    className="flex-1 py-2 px-4 border border-[#475569] text-[#F1F5F9] rounded-lg hover:bg-[#334155] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleBookSlot}
                    disabled={!selectedSlot || isLoading}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                      !selectedSlot || isLoading
                        ? 'bg-[#94A3B8] cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:opacity-90 text-white'
                    }`}
                  >
                    {isLoading ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
};