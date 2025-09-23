"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { EnergyAnimation } from '@/components/ui/EnergyAnimation';
import { useLoadScript, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';

interface MapSectionProps {
  onBookPay: () => void;
}

// Define the map container style
const mapContainerStyle = {
  width: '100%',
  height: '60vh',
};

// Define the initial center of the map
const center = {
  lat: 28.613939, // New Delhi coordinates
  lng: 77.209021,
};

// Define the map options
const options = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    {
      featureType: 'all',
      elementType: 'labels',
      stylers: [{ visibility: 'on' }],
    },
    {
      featureType: 'administrative',
      elementType: 'labels',
      stylers: [{ color: '#CBD5E1' }],
    },
    {
      featureType: 'landscape',
      elementType: 'all',
      stylers: [{ color: '#1E293B' }],
    },
    {
      featureType: 'poi',
      elementType: 'all',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'road',
      elementType: 'all',
      stylers: [{ color: '#334155' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'all',
      stylers: [{ visibility: 'simplified' }],
    },
    {
      featureType: 'road.arterial',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit',
      elementType: 'all',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'water',
      elementType: 'all',
      stylers: [{ color: '#0F172A' }],
    },
  ],
};

// Define the charging stations
const chargingStations = [
  {
    id: 1,
    position: { lat: 28.613939, lng: 77.209021 },
    name: 'Delhi Metro Station',
    slots: 12,
    available: 8,
  },
  {
    id: 2,
    position: { lat: 28.632800, lng: 77.219400 },
    name: 'Connaught Place',
    slots: 10,
    available: 5,
  },
  {
    id: 3,
    position: { lat: 28.589700, lng: 77.211000 },
    name: 'South Delhi Hub',
    slots: 15,
    available: 12,
  },
];

export const MapSection: React.FC<MapSectionProps> = ({ onBookPay }) => {
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [showFallback, setShowFallback] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  const handleStationClick = (station: any) => {
    setSelectedStation(station);
  };

  const handleCloseInfoWindow = () => {
    setSelectedStation(null);
  };

  const handleBookSlot = () => {
    onBookPay();
    setSelectedStation(null);
  };

  if (loadError) {
    return (
      <section id="map" className="relative h-[60vh] w-full bg-[#334155] overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Map Loading Error</h2>
          <p className="text-[#CBD5E1] mb-6">Failed to load Google Maps</p>
          <Button 
            onClick={onBookPay}
            className="bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white px-6 py-3 rounded-lg font-medium hover:from-[#7C3AED] hover:to-[#059669] transition-all"
          >
            Find Bunks
          </Button>
        </div>
      </section>
    );
  }

  if (!isLoaded) {
    return (
      <section id="map" className="relative h-[60vh] w-full bg-[#334155] overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Loading Map...</h2>
          <p className="text-[#CBD5E1] mb-6">Please wait while we load the map</p>
        </div>
      </section>
    );
  }

  return (
    <section id="map" className="relative h-[60vh] w-full overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={center}
        options={options}
      >
        {chargingStations.map((station) => (
          <Marker
            key={station.id}
            position={station.position}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: station.available > 0 ? '#10B981' : '#EF4444',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            }}
            onClick={() => handleStationClick(station)}
          />
        ))}

        {selectedStation && (
          <InfoWindow
            position={selectedStation.position}
            onCloseClick={handleCloseInfoWindow}
          >
            <div className="p-2 min-w-[200px]">
              <h3 className="font-bold text-[#1E293B]">{selectedStation.name}</h3>
              <p className="text-sm text-[#334155] mt-1">
                Available slots: {selectedStation.available}/{selectedStation.slots}
              </p>
              <div className="mt-2">
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white text-xs"
                  onClick={handleBookSlot}
                  disabled={selectedStation.available === 0}
                >
                  {selectedStation.available === 0 ? 'No Slots' : 'Book Slot'}
                </Button>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
      
      {/* Energy animations */}
      <div className="absolute top-10 left-10 w-24 h-24 opacity-30">
        <EnergyAnimation />
      </div>
      <div className="absolute bottom-10 right-10 w-32 h-32 opacity-20">
        <EnergyAnimation />
      </div>
    </section>
  );
};