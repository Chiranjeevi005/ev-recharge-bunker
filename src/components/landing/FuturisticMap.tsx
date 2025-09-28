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
  position: [number, number];
  slots: number;
  available: number;
  pricing: string;
  distance: string;
}

export const FuturisticMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [mapStyle, setMapStyle] = useState<'liberty' | 'positron' | 'bright'>('liberty');
  const [favorites, setFavorites] = useState<number[]>([]);

  // Sample charging stations data
  const chargingStations: ChargingStation[] = [
    {
      id: 1,
      name: 'Delhi Metro Station',
      position: [77.209021, 28.613939],
      slots: 12,
      available: 8,
      pricing: '₹25/min',
      distance: '0.5 km'
    },
    {
      id: 2,
      name: 'Connaught Place Hub',
      position: [77.219400, 28.632800],
      slots: 10,
      available: 5,
      pricing: '₹30/min',
      distance: '1.2 km'
    },
    {
      id: 3,
      name: 'South Delhi Complex',
      position: [77.211000, 28.589700],
      slots: 15,
      available: 12,
      pricing: '₹20/min',
      distance: '2.3 km'
    },
    {
      id: 4,
      name: 'East Delhi Mall',
      position: [77.280000, 28.620000],
      slots: 8,
      available: 3,
      pricing: '₹35/min',
      distance: '3.1 km'
    },
    {
      id: 5,
      name: 'North Delhi Center',
      position: [77.190000, 28.680000],
      slots: 20,
      available: 15,
      pricing: '₹22/min',
      distance: '4.5 km'
    }
  ];

  // Toggle favorite status for a station
  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(favId => favId !== id) 
        : [...prev, id]
    );
  };

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

    // Add custom markers for charging stations
    chargingStations.forEach(station => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.innerHTML = `
        <div class="${favorites.includes(station.id) ? 'favorite-marker' : 'station-marker'}">
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
        .addTo(map);
    });

    // Add user location marker
    const userEl = document.createElement('div');
    userEl.className = 'user-marker';
    userEl.innerHTML = '<div class="pulse"></div>';
    
    new maplibregl.Marker({
      element: userEl,
      anchor: 'center'
    })
      .setLngLat([77.209021, 28.613939])
      .addTo(map);

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
      // Removed the beforeId parameter to avoid referencing non-existing layers
    });

    // Clean up on unmount
    return () => {
      map.remove();
    };
  }, [favorites]);

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

  return (
    <div className="relative w-full h-[500px] rounded-2xl overflow-hidden border border-[#475569] shadow-xl shadow-[#8B5CF6]/10">
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
              <p className="text-sm text-[#94A3B8]">{selectedStation.distance}</p>
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
          </div>
          
          <div className="mt-4 flex space-x-2">
            <button 
              className="flex-1 py-2 px-4 bg-[#334155] hover:bg-[#475569] text-[#F1F5F9] rounded-lg transition-colors"
              onClick={() => toggleFavorite(selectedStation.id)}
            >
              {favorites.includes(selectedStation.id) ? '★ Favorited' : '☆ Favorite'}
            </button>
            <button className="flex-1 py-2 px-4 bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white rounded-lg hover:opacity-90 transition-opacity">
              Book Now
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Custom CSS for map styling */}
      <style jsx>{`
        .marker {
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        }
        
        .station-marker {
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #00ffff, #8B5CF6);
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 16px;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.7);
          border: 2px solid white;
          transition: all 0.3s ease;
        }
        
        .station-marker:hover {
          transform: scale(1.2);
          box-shadow: 0 0 15px rgba(139, 92, 246, 1);
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
        
        .user-marker {
          width: 20px;
          height: 20px;
          background: #10B981;
          border-radius: 50%;
          border: 2px solid white;
          position: relative;
        }
        
        .pulse {
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.5);
          animation: pulse-animation 2s infinite;
        }
        
        @keyframes pulse-animation {
          0% {
            transform: scale(0.8);
            opacity: 0.7;
          }
          70% {
            transform: scale(2);
            opacity: 0;
          }
          100% {
            transform: scale(0.8);
            opacity: 0;
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