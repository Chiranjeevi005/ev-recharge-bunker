"use client";

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
// @ts-ignore
import 'maplibre-gl/dist/maplibre-gl.css';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Toast from '@/components/common/Toast';

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

export const FuturisticMap: React.FC<{ userId?: string | undefined; location?: string | null; refreshKey?: number }> = ({ userId, location = null, refreshKey = 0 }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [chargingStations, setChargingStations] = useState<ChargingStation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const markerRefs = useRef<maplibregl.Marker[]>([]);
  const router = useRouter();
  const { data: session } = useSession();
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  console.log('FuturisticMap: Component rendered with userId:', userId, 'refreshKey:', refreshKey);

  // Fetch charging stations based on user ID
  useEffect(() => {
    console.log('FuturisticMap: useEffect triggered with userId:', userId, 'location:', location, 'refreshKey:', refreshKey);
    
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
        
        // Build API URL with userId and location if available
        let apiUrl = `/api/dashboard/stations?userId=${encodeURIComponent(userId)}`;
        if (location) {
          apiUrl += `&location=${encodeURIComponent(location)}`;
        }
        
        console.log('FuturisticMap: Fetching stations with URL:', apiUrl);
        const response = await fetch(apiUrl);
        console.log('FuturisticMap: API response status:', response.status);
        
        if (response.ok) {
          const stations = await response.json();
          console.log('FuturisticMap: Received stations:', stations);
          // Filter out stations with invalid coordinates and map _id to id
          const validStations = stations
            .filter((station: any) => {
              // Validate both lat and lng with enhanced validation
              return isValidLatLng(station.lat, station.lng);
            })
            .map((station: any) => {
              // Parse coordinates safely
              const lat = parseCoordinate(station.lat) || 0;
              const lng = parseCoordinate(station.lng) || 0;
              
              return {
                // Map _id to id to match the ChargingStation interface
                id: station._id || station.id || '',
                name: station.name || 'Unknown Station',
                address: station.address || 'Unknown Location',
                lat: lat,
                lng: lng,
                slots: Array.isArray(station.slots) ? station.slots : []
              };
            });
          console.log('FuturisticMap: Valid stations after filtering:', validStations);
          setChargingStations(validStations);
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
  }, [userId, location, refreshKey]);

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
      
      // Only proceed if container has valid dimensions
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
      const defaultCenter: [number, number] = chargingStations.length > 0 && chargingStations[0] 
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
          // Additional validation for coordinate ranges and validity
          if (!isValidLatLng(station.lat, station.lng)) {
            console.warn('FuturisticMap: Skipping station with invalid coordinates:', station);
            return;
          }
          
          // Check coordinate ranges
          if (Math.abs(station.lat) > 90 || Math.abs(station.lng) > 180) {
            console.warn('FuturisticMap: Skipping station with out-of-range coordinates:', station);
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
            setSelectedStation(station);
          });
          
          if (mapRef.current) {
            try {
              const marker = new maplibregl.Marker({
                element: el,
                anchor: 'center'
              })
                .setLngLat([station.lng, station.lat])
                .addTo(mapRef.current);
              
              markerRefs.current.push(marker);
            } catch (error) {
              console.error('FuturisticMap: Error creating marker for station:', station, error);
            }
          }
        });

        // Fit map to show all stations
        if (chargingStations.length > 0 && mapRef.current) {
          try {
            const bounds = new maplibregl.LngLatBounds();
            let validStationCount = 0;
            
            chargingStations.forEach(station => {
              // Validate coordinates before extending bounds
              if (!isValidLatLng(station.lat, station.lng)) {
                return;
              }
              
              // Check coordinate ranges
              if (Math.abs(station.lat) > 90 || Math.abs(station.lng) > 180) {
                return;
              }
              
              try {
                bounds.extend([station.lng, station.lat]);
                validStationCount++;
              } catch (error) {
                console.warn('FuturisticMap: Error extending bounds for station:', station, error);
              }
            });
            
            // Only fit bounds if we have valid stations
            if (validStationCount > 0 && !bounds.isEmpty()) {
              mapRef.current.fitBounds(bounds, {
                padding: 50,
                maxZoom: 15
              });
            } else {
              console.warn('FuturisticMap: No valid stations to fit bounds');
            }
          } catch (error) {
            console.error('FuturisticMap: Error fitting bounds:', error);
          }
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

  // Handle booking
  const handleBookNow = async () => {
    if (!selectedStation || !userId) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get the first available slot
      const availableSlot = selectedStation.slots.find(slot => slot.status === 'available');
      
      if (!availableSlot) {
        setToast({
          message: 'No available slots at this station',
          type: 'error'
        });
        setIsLoading(false);
        return;
      }
      
      // Create a payment order
      const response = await fetch('/api/payment/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stationId: selectedStation.id,
          slotId: availableSlot.slotId,
          duration: 1, // Default to 1 hour
          amount: availableSlot.pricePerHour, // ₹ per hour
          userId: userId
        }),
      });
      
      const orderData = await response.json();
      
      if (!response.ok || orderData.error) {
        throw new Error(orderData.error || 'Failed to create payment order');
      }
      
      // Load Razorpay script
      const loadRazorpay = () => {
        return new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => {
            resolve(true);
          };
          script.onerror = () => {
            resolve(false);
          };
          document.body.appendChild(script);
        });
      };
      
      const res = await loadRazorpay();
      if (!res) {
        throw new Error('Failed to load payment gateway');
      }
      
      // Initialize Razorpay
      const razorpayKey = (process.env["NEXT_PUBLIC_RAZORPAY_KEY_ID"] || 'rzp_test_example').trim();
      
      // Validate Razorpay key
      if (!razorpayKey || razorpayKey === 'rzp_test_example') {
        throw new Error('Payment gateway not properly configured');
      }
      
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'EV Bunker',
        description: `Booking at ${selectedStation.name}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            console.log('Razorpay response received:', response);
            
            // Basic validation of Razorpay response
            if (!response.razorpay_order_id || !response.razorpay_payment_id || !response.razorpay_signature) {
              console.error('Invalid Razorpay response:', response);
              setToast({
                message: 'Invalid payment response received',
                type: 'error'
              });
              setIsLoading(false);
              return;
            }
            
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            
            const verifyData = await verifyResponse.json();
            console.log('Payment verification response:', verifyData);
            
            if (verifyData.success) {
              // Redirect to confirmation page
              router.push(`/confirmation?bookingId=${verifyData.bookingId}&paymentId=${verifyData.paymentId}`);
            } else {
              const errorMessage = verifyData.error || 'Payment verification failed';
              console.error('Payment verification failed:', errorMessage);
              setToast({
                message: `Payment verification failed: ${errorMessage}`,
                type: 'error'
              });
            }
          } catch (verifyError) {
            console.error('Error verifying payment:', verifyError);
            setToast({
              message: 'Error verifying payment. Please contact support.',
              type: 'error'
            });
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: session?.user?.name || 'User',
          email: session?.user?.email || 'user@example.com',
        },
        theme: {
          color: '#10B981',
        },
        modal: {
          ondismiss: function() {
            console.log('Payment dialog closed by user');
            setIsLoading(false);
          }
        }
      };
      
      // Initialize Razorpay with error handling
      try {
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        
        // Add error handling for Razorpay
        rzp.on('payment.failed', function (response: any) {
          console.error('Payment failed:', response);
          try {
            const errorMessage = response.error?.description || 'Payment failed';
            const errorCode = response.error?.code || 'UNKNOWN_ERROR';
            console.error('Payment failure details:', { code: errorCode, description: errorMessage });
            setToast({
              message: `Payment failed: ${errorMessage} (Code: ${errorCode})`,
              type: 'error'
            });
          } catch (e) {
            console.error('Error processing payment failure:', e);
            setToast({
              message: 'Payment failed. Please try again.',
              type: 'error'
            });
          }
          setIsLoading(false);
        });
        
        rzp.open();
      } catch (rzpError: any) {
        console.error('Error initializing Razorpay:', rzpError);
        setToast({
          message: `Failed to initialize payment gateway: ${rzpError.message || 'Unknown error'}`,
          type: 'error'
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error booking slot:', error);
      setToast({
        message: `Error booking slot: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
      setIsLoading(false);
    }
  };

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
            <button 
              onClick={handleBookNow}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Book Now'}
            </button>
          </div>
        </div>
      )}
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};