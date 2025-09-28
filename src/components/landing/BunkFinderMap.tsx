"use client";

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion } from 'framer-motion';

// Import MapLibre Geocoder
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
import type { MaplibreGeocoderApi, MaplibreGeocoderApiConfig, MaplibreGeocoderFeatureResults, CarmenGeojsonFeature } from '@maplibre/maplibre-gl-geocoder';

interface ChargingStation {
  id: number;
  name: string;
  address: string;
  phone: string;
  position: [number, number];
  slots: number;
  available: number;
  pricing: string;
  distance: string;
  fastCharging: boolean;
}

interface BookingData {
  stationId: number;
  slotId: string;
  bunkName: string;
  amount: number;
}

export const BunkFinderMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [mapStyle, setMapStyle] = useState<'liberty' | 'positron' | 'bright'>('liberty');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [chargingStations, setChargingStations] = useState<ChargingStation[]>([]);
  const [filters, setFilters] = useState({
    availableOnly: false,
    fastCharging: false,
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
            id: 1,
            name: 'Delhi Metro Station',
            address: 'Rajiv Chowk, New Delhi',
            phone: '+91 11 2345 6789',
            position: [77.209021, 28.613939],
            slots: 12,
            available: 8,
            pricing: '₹25/min',
            distance: '0.5 km',
            fastCharging: true
          },
          {
            id: 2,
            name: 'Connaught Place Hub',
            address: 'Connaught Place, New Delhi',
            phone: '+91 11 3456 7890',
            position: [77.219400, 28.632800],
            slots: 10,
            available: 5,
            pricing: '₹30/min',
            distance: '1.2 km',
            fastCharging: true
          },
          {
            id: 3,
            name: 'South Delhi Complex',
            address: 'Hauz Khas, New Delhi',
            phone: '+91 11 4567 8901',
            position: [77.211000, 28.589700],
            slots: 15,
            available: 12,
            pricing: '₹20/min',
            distance: '2.3 km',
            fastCharging: false
          },
          {
            id: 4,
            name: 'East Delhi Mall',
            address: 'Welcome Metro Station, Delhi',
            phone: '+91 11 5678 9012',
            position: [77.280000, 28.620000],
            slots: 8,
            available: 3,
            pricing: '₹35/min',
            distance: '3.1 km',
            fastCharging: true
          },
          {
            id: 5,
            name: 'North Delhi Center',
            address: 'Kashmere Gate, Delhi',
            phone: '+91 11 6789 0123',
            position: [77.190000, 28.680000],
            slots: 20,
            available: 15,
            pricing: '₹22/min',
            distance: '4.5 km',
            fastCharging: false
          }
        ]);
      }
    };

    loadStations();
  }, []);

  // Toggle favorite status for a station
  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(favId => favId !== id) 
        : [...prev, id]
    );
  };

  // Filter stations based on filters
  const filteredStations = chargingStations.filter(station => {
    if (filters.availableOnly && station.available === 0) return false;
    if (filters.fastCharging && !station.fastCharging) return false;
    // Extract numeric price for comparison
    const price = parseInt(station.pricing.replace(/[^\d]/g, ''));
    if (price > filters.maxPrice) return false;
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
      const existingMarker = document.querySelector(`.station-marker-${station.id}`);
      if (existingMarker) {
        existingMarker.remove();
      }

      const el = document.createElement('div');
      el.className = `station-marker-container station-marker-${station.id}`;
      el.innerHTML = `
        <div class="${favorites.includes(station.id) ? 'favorite-marker' : station.available > 0 ? 'station-marker available' : 'station-marker unavailable'}">
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
        .setLngLat(station.position)
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
      const response = await fetch('/api/stations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stationId: selectedStation.id,
          slotId: selectedSlot
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update local state to reflect booked slot
        setChargingStations(prev => 
          prev.map(station => 
            station.id === selectedStation.id 
              ? { ...station, available: station.available - 1 } 
              : station
          )
        );
        
        // Set booking data for confirmation
        setBookingData({
          stationId: selectedStation.id,
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
      fastCharging: false,
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
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="fast" 
              className="mr-2 h-4 w-4 rounded border-[#475569] bg-[#334155] text-[#8B5CF6] focus:ring-[#8B5CF6]"
              checked={filters.fastCharging}
              onChange={(e) => setFilters({...filters, fastCharging: e.target.checked})}
            />
            <label htmlFor="fast" className="text-xs text-[#CBD5E1]">Fast Charging</label>
          </div>
          <div>
            <label className="block text-xs text-[#CBD5E1] mb-1">Max Price (₹/min)</label>
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
              <p className="text-sm text-[#94A3B8]">{selectedStation.address}</p>
              <p className="text-xs text-[#94A3B8] mt-1">{selectedStation.phone}</p>
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
                {selectedStation.available}/{selectedStation.slots}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#94A3B8]">Pricing</p>
              <p className="text-lg font-bold text-[#F1F5F9]">{selectedStation.pricing}</p>
            </div>
            <div>
              <p className="text-sm text-[#94A3B8]">Fast Charging</p>
              <p className="text-lg font-bold text-[#F1F5F9]">
                {selectedStation.fastCharging ? '✓' : '✗'}
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex space-x-2">
            <button 
              className="flex-1 py-2 px-4 bg-[#334155] hover:bg-[#475569] text-[#F1F5F9] rounded-lg transition-colors"
              onClick={() => toggleFavorite(selectedStation.id)}
            >
              {favorites.includes(selectedStation.id) ? '★ Favorited' : '☆ Favorite'}
            </button>
            <button 
              className={`flex-1 py-2 px-4 rounded-lg transition-opacity ${
                selectedStation.available > 0
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white hover:opacity-90'
                  : 'bg-[#94A3B8] text-[#1E293B] cursor-not-allowed'
              }`}
              onClick={() => {
                if (selectedStation.available > 0) {
                  setIsBookingPanelOpen(true);
                }
              }}
              disabled={selectedStation.available === 0}
            >
              {selectedStation.available > 0 ? 'Book Slot' : 'No Slots'}
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
              <div className="px-4 py-3 sm:px-6 sm:py-5">
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Select Slot</label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {Array.from({ length: selectedStation.slots }, (_, i) => {
                      const slotId = `Slot-${i + 1}`;
                      const isAvailable = i < selectedStation.available;
                      return (
                        <button
                          key={slotId}
                          className={`bg-[#334155] border rounded-lg py-2 text-white transition-colors text-sm sm:text-base ${
                            selectedSlot === slotId 
                              ? 'border-[#10B981] bg-[#10B981]/20' 
                              : isAvailable
                                ? 'border-[#475569] hover:bg-[#475569]'
                                : 'border-[#94A3B8] bg-[#94A3B8]/20 cursor-not-allowed opacity-50'
                          }`}
                          onClick={() => isAvailable && setSelectedSlot(slotId)}
                          disabled={!isAvailable}
                        >
                          {slotId}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {selectedSlot && (
                  <div className="mb-4 sm:mb-6 p-3 bg-[#334155]/50 rounded-lg border border-[#475569]">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-[#94A3B8]">Selected Slot</p>
                        <p className="font-medium text-white">{selectedSlot}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[#94A3B8]">Estimated Cost</p>
                        <p className="font-medium text-white">₹250</p>
                        <p className="text-xs text-[#94A3B8]">for 10 minutes</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 sm:space-x-3">
                  <button
                    onClick={() => setIsBookingPanelOpen(false)}
                    className="border border-[#475569] text-[#CBD5E1] hover:bg-[#334155] px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg transition-colors"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white hover:from-[#7C3AED] hover:to-[#059669] px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg transition-colors disabled:opacity-50"
                    onClick={handleBookSlot}
                    disabled={!selectedSlot || isLoading}
                  >
                    {isLoading ? 'Processing...' : `Pay ₹250`}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
      
      {/* Custom CSS for map styling */}
      <style jsx>{`
        .station-marker-container {
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        }
        
        .station-marker {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 16px;
          border: 2px solid white;
          transition: all 0.3s ease;
        }
        
        .station-marker.available {
          background: linear-gradient(135deg, #00ffff, #8B5CF6);
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.7);
          animation: pulse 2s infinite;
        }
        
        .station-marker.available:hover {
          transform: scale(1.2);
          box-shadow: 0 0 15px rgba(139, 92, 246, 1);
        }
        
        .station-marker.unavailable {
          background: linear-gradient(135deg, #64748B, #94A3B8);
          box-shadow: 0 0 10px rgba(100, 116, 139, 0.7);
          opacity: 0.7;
        }
        
        .favorite-marker {
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #F59E0B, #F97316);
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 16px;
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.8);
          border: 2px solid white;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7);
          }
          70% {
            transform: scale(1.1);
            box-shadow: 0 0 0 10px rgba(139, 92, 246, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(139, 92, 246, 0);
          }
        }
        
        .neon-button {
          width: 36px;
          height: 36px;
          background: #1E293B;
          border: 1px solid #475569;
          border-radius: 8px;
          color: #F1F5F9;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 0 5px rgba(139, 92, 246, 0.3);
        }
        
        .neon-button:hover {
          background: #334155;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.7);
          border-color: #8B5CF6;
        }
        
        .maplibregl-ctrl-top-left {
          top: 1rem;
          left: 1rem;
        }
        
        .maplibregl-ctrl-top-right {
          top: 1rem;
          right: 1rem;
        }
        
        .maplibregl-ctrl-group {
          background: rgba(30, 41, 59, 0.8) !important;
          backdrop-filter: blur(4px);
          border: 1px solid #475569 !important;
          border-radius: 8px !important;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.3) !important;
        }
        
        .maplibregl-ctrl-group button {
          background: transparent !important;
          color: #F1F5F9 !important;
          border-bottom: 1px solid #475569 !important;
        }
        
        .maplibregl-ctrl-group button:hover {
          background: rgba(51, 65, 85, 0.5) !important;
        }
        
        .maplibregl-ctrl-geocoder {
          background: rgba(30, 41, 59, 0.8) !important;
          backdrop-filter: blur(4px);
          border: 1px solid #475569 !important;
          border-radius: 8px !important;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.3) !important;
          color: #F1F5F9 !important;
          min-width: 300px !important;
        }
        
        .maplibregl-ctrl-geocoder--input {
          background: transparent !important;
          color: #F1F5F9 !important;
          font-family: var(--font-sans) !important;
        }
        
        .maplibregl-ctrl-geocoder--input::placeholder {
          color: #94A3B8 !important;
        }
        
        .maplibregl-ctrl-geocoder--icon-search {
          fill: #94A3B8 !important;
        }
        
        .maplibregl-popup {
          background: rgba(30, 41, 59, 0.9) !important;
          backdrop-filter: blur(4px);
          border: 1px solid #475569 !important;
          border-radius: 8px !important;
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.5) !important;
        }
        
        .maplibregl-popup-content {
          background: transparent !important;
          padding: 12px !important;
          color: #F1F5F9 !important;
        }
        
        .maplibregl-popup-close-button {
          color: #94A3B8 !important;
          font-size: 20px !important;
        }
        
        .maplibregl-popup-close-button:hover {
          color: #F1F5F9 !important;
          background: transparent !important;
        }
        
        .maplibregl-popup-tip {
          border-top-color: #475569 !important;
        }
        
        /* Hide default navigation controls */
        .maplibregl-ctrl-nav {
          display: none !important;
        }
      `}</style>
    </div>
  );
};