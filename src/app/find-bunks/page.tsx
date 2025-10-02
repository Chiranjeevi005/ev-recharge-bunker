"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { useLoader } from '@/lib/LoaderContext'; // Added import

// Declare Razorpay on window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Dynamically import FindBunksMap to avoid SSR issues with MapLibre
const DynamicFindBunksMap = dynamic(
  () => import("@/components/landing").then((mod) => mod.FindBunksMap),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-gradient-to-br from-[#1E293B] to-[#334155] rounded-xl animate-pulse" />
    )
  }
);

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

interface Booking {
  _id: string;
  userId: string;
  stationId: string;
  slotId: string;
  startTime: string;
  endTime: string;
  amount: number;
  paymentId: string;
  status: string;
}

export default function FindBunksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [duration, setDuration] = useState(1); // in hours
  const [bookingData, setBookingData] = useState({
    startTime: "",
    endTime: "",
  });
  
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { showLoader, hideLoader } = useLoader(); // Added loader context

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

  // Focus on search input when page loads
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Fetch stations data
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setIsLoading(true);
        showLoader("Loading stations..."); // Show loader
        
        const response = await fetch("/api/stations");
        const data = await response.json();
        setStations(data);
        setFilteredStations(data);
        hideLoader(); // Hide loader
      } catch (error) {
        console.error("Error fetching stations:", error);
        hideLoader(); // Hide loader
      } finally {
        setIsLoading(false);
      }
    };

    fetchStations();
  }, []);

  // Filter stations based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStations(stations);
      return;
    }

    const filtered = stations.filter(station => 
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredStations(filtered);
  }, [searchQuery, stations]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would trigger a new search
    // For now, we're just filtering the existing data
  };

  const handleStationSelect = (station: Station) => {
    setSelectedStation(station);
  };

  const handleBookSlot = (slotId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
    
    setSelectedSlot(slotId);
    setBookingModalOpen(true);
    
    // Set default booking times
    const now = new Date();
    const startTime = now.toISOString().slice(0, 16);
    const endTime = new Date(now.getTime() + 3600000).toISOString().slice(0, 16);
    
    setBookingData({
      startTime,
      endTime,
    });
  };

  const calculatePrice = () => {
    if (!selectedStation || !selectedSlot || duration <= 0) return 0;
    
    const slot = selectedStation.slots.find(s => s.slotId === selectedSlot);
    if (!slot) return 0;
    
    return slot.pricePerHour * duration;
  };

  const handlePayment = async () => {
    if (!selectedStation || !selectedSlot || !user) return;
    
    try {
      showLoader("Processing payment..."); // Show loader
      
      // Load Razorpay script first
      const res = await loadRazorpay();
      
      if (!res) {
        hideLoader(); // Hide loader
        alert('Failed to load Razorpay. Please try again.');
        return;
      }
      
      // Create booking order
      console.log("Creating payment order with:", {
        userId: user.id,
        stationId: selectedStation._id,
        slotId: selectedSlot,
        duration,
        amount: calculatePrice(),
      });
      
      const response = await fetch("/api/payment/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id, // Include userId in the request
          stationId: selectedStation._id,
          slotId: selectedSlot,
          duration,
          amount: calculatePrice(),
        }),
      });
      
      const orderData = await response.json();
      console.log("Payment order response:", orderData);
      
      if (orderData.orderId) {
        // Initialize Razorpay
        const options = {
          key: process.env.NEXT_PUBLIC_RZP_KEY_ID || 'rzp_test_example',
          amount: orderData.amount,
          currency: orderData.currency,
          name: "EV Bunker",
          description: `Booking for ${selectedStation.name}`,
          order_id: orderData.orderId,
          handler: async function (response: any) {
            console.log("Razorpay response received:", response);
            
            try {
              // Verify payment
              const verifyResponse = await fetch("/api/payment/verify", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
              
              const verifyData = await verifyResponse.json();
              console.log("Payment verification response:", verifyData);
              
              if (verifyData.success) {
                hideLoader(); // Hide loader
                // Redirect to confirmation page
                router.push(`/confirmation?bookingId=${verifyData.bookingId}`);
              } else {
                hideLoader(); // Hide loader
                console.error("Payment verification failed:", verifyData.error);
                alert("Payment verification failed. Please contact support.");
              }
            } catch (verifyError) {
              hideLoader(); // Hide loader
              console.error("Error verifying payment:", verifyError);
              alert("Failed to verify payment. Please contact support.");
            }
          },
          prefill: {
            name: user.name || "",
            email: user.email || "",
          },
          theme: {
            color: "#10B981",
          },
        };
        
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      hideLoader(); // Hide loader
      console.error("Payment error:", error);
    }
  };

  if (authLoading) {
    // Return null since we're using the global loader
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B]">
      <Navbar />
      
      {/* Add padding top to account for fixed navbar */}
      <main className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] to-[#10B981] mb-4"
          >
            Find EV Charging Stations
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-[#94A3B8] max-w-2xl mx-auto"
          >
            Discover the nearest EV charging stations with real-time availability and book your slot instantly
          </motion.p>
        </div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto mb-10"
        >
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search by city, station name, or address..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-3 bg-[#1E293B] border border-[#334155] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent placeholder-[#94A3B8] transition-all duration-200"
            />
            <Button 
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:from-[#7C3AED] hover:to-[#059669] text-white font-medium py-1.5 px-4 rounded-lg transition-all duration-200"
            >
              Search
            </Button>
          </form>
        </motion.div>

        {/* Map and Station List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Map Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-1"
          >
            <Card className="bg-[#1E293B]/50 border border-[#334155] backdrop-blur-xl p-6">
              <h2 className="text-xl font-bold text-[#F1F5F9] mb-4">Charging Station Map</h2>
              <div className="h-96 rounded-xl overflow-hidden">
                {typeof window !== 'undefined' && (
                  <DynamicFindBunksMap 
                    stations={filteredStations} 
                    onStationSelect={handleStationSelect}
                    selectedStation={selectedStation}
                  />
                )}
              </div>
            </Card>
          </motion.div>

          {/* Station List */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-1"
          >
            <Card className="bg-[#1E293B]/50 border border-[#334155] backdrop-blur-xl p-6">
              <h2 className="text-xl font-bold text-[#F1F5F9] mb-4">
                {filteredStations.length} Charging Stations Found
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {isLoading ? (
                  // Return null since we're using the global loader
                  null
                ) : filteredStations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[#94A3B8]">No charging stations found. Try a different search.</p>
                  </div>
                ) : (
                  filteredStations.map((station) => (
                    <motion.div
                      key={station._id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                        selectedStation?._id === station._id
                          ? "bg-[#334155] border-[#10B981]"
                          : "bg-[#1E293B] border-[#334155] hover:border-[#8B5CF6]"
                      }`}
                      onClick={() => handleStationSelect(station)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-[#F1F5F9] text-lg">{station.name}</h3>
                          <p className="text-[#94A3B8] text-sm mt-1">{station.address}</p>
                          <p className="text-[#94A3B8] text-sm mt-1">{station.city}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#10B981]/20 text-[#10B981]">
                            {station.slots.filter(s => s.status === "available").length} slots available
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {station.slots.slice(0, 3).map((slot) => (
                          <span 
                            key={slot.slotId}
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                              slot.status === "available" 
                                ? "bg-[#10B981]/20 text-[#10B981]" 
                                : slot.status === "occupied" 
                                  ? "bg-[#EF4444]/20 text-[#EF4444]" 
                                  : "bg-[#94A3B8]/20 text-[#94A3B8]"
                            }`}
                          >
                            {slot.chargerType}
                          </span>
                        ))}
                        {station.slots.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[#334155] text-[#94A3B8]">
                            +{station.slots.length - 3} more
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStationSelect(station);
                        }}
                        className="mt-3 w-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:from-[#7C3AED] hover:to-[#059669] text-white"
                      >
                        View Details
                      </Button>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Selected Station Details */}
        {selectedStation && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <Card className="bg-[#1E293B]/50 border border-[#334155] backdrop-blur-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#F1F5F9]">{selectedStation.name}</h2>
                  <p className="text-[#94A3B8] mt-1">{selectedStation.address}, {selectedStation.city}</p>
                </div>
                <Button 
                  onClick={() => setSelectedStation(null)}
                  variant="secondary"
                  className="text-[#94A3B8] hover:text-[#F1F5F9]"
                >
                  Close
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-[#F1F5F9] text-lg mb-3">Available Slots</h3>
                  <div className="space-y-3">
                    {selectedStation.slots.map((slot) => (
                      <div 
                        key={slot.slotId}
                        className={`p-3 rounded-lg border transition-all duration-200 ${
                          slot.status === "available"
                            ? "border-[#10B981]/30 bg-[#10B981]/10"
                            : slot.status === "occupied"
                              ? "border-[#EF4444]/30 bg-[#EF4444]/10"
                              : "border-[#94A3B8]/30 bg-[#94A3B8]/10"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-[#F1F5F9]">{slot.chargerType}</h4>
                            <p className="text-sm text-[#94A3B8]">
                              ₹{slot.pricePerHour}/hour
                            </p>
                          </div>
                          <span 
                            className={`px-2 py-1 rounded-md text-xs font-medium ${
                              slot.status === "available"
                                ? "bg-[#10B981]/20 text-[#10B981]"
                                : slot.status === "occupied"
                                  ? "bg-[#EF4444]/20 text-[#EF4444]"
                                  : "bg-[#94A3B8]/20 text-[#94A3B8]"
                            }`}
                          >
                            {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
                          </span>
                        </div>
                        {slot.status === "available" && (
                          <Button
                            onClick={() => handleBookSlot(slot.slotId)}
                            className="mt-2 w-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:from-[#7C3AED] hover:to-[#059669] text-white"
                          >
                            Book Slot
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-[#F1F5F9] text-lg mb-3">Station Information</h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-[#334155]/50">
                      <p className="text-sm text-[#94A3B8]">Total Slots</p>
                      <p className="text-[#F1F5F9] font-medium">{selectedStation.slots.length}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#334155]/50">
                      <p className="text-sm text-[#94A3B8]">Available Slots</p>
                      <p className="text-[#10B981] font-medium">
                        {selectedStation.slots.filter(s => s.status === "available").length}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#334155]/50">
                      <p className="text-sm text-[#94A3B8]">Occupied Slots</p>
                      <p className="text-[#EF4444] font-medium">
                        {selectedStation.slots.filter(s => s.status === "occupied").length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </main>

      {/* Booking Modal */}
      {bookingModalOpen && selectedStation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-[#1E293B] border border-[#334155] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#F1F5F9]">Book Charging Slot</h3>
                <button 
                  onClick={() => setBookingModalOpen(false)}
                  className="text-[#94A3B8] hover:text-[#F1F5F9]"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-[#334155]/50 rounded-lg">
                  <h4 className="font-bold text-[#F1F5F9]">{selectedStation.name}</h4>
                  <p className="text-sm text-[#94A3B8]">{selectedStation.address}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#CBD5E1] mb-2">
                    Select Duration (hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={duration}
                    onChange={(e) => setDuration(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
                    className="w-full px-3 py-2 bg-[#334155] border border-[#475569] rounded-lg text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  />
                </div>
                
                <div className="p-4 bg-[#334155]/50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-[#94A3B8]">Price per hour:</span>
                    <span className="text-[#F1F5F9]">
                      ₹{selectedStation.slots.find(s => s.slotId === selectedSlot)?.pricePerHour || 0}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[#94A3B8]">Duration:</span>
                    <span className="text-[#F1F5F9]">{duration} hour(s)</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[#94A3B8]">Total Price:</span>
                    <span className="text-[#10B981] font-bold text-lg">
                      ₹{calculatePrice()}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={() => setBookingModalOpen(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePayment}
                    className="flex-1 bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:from-[#7C3AED] hover:to-[#059669] text-white"
                  >
                    Proceed to Pay
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}