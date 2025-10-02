import React from 'react';
import { Button } from '@/components/ui/Button';

interface SlotAvailability {
  stationId: string;
  stationName: string;
  slotsAvailable: number;
  waitingTime: string;
  location: string;
}

interface SlotAvailabilityCardProps {
  availability: SlotAvailability[];
  onBookSlot: () => void;
}

const SlotAvailabilityCard: React.FC<SlotAvailabilityCardProps> = ({ availability, onBookSlot }) => {
  // Get icon based on station name
  const getStationIcon = (stationName: string) => {
    if (stationName.includes('Metro') || stationName.includes('metro')) {
      return (
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
        </svg>
      );
    } else if (stationName.includes('Connaught') || stationName.includes('Place')) {
      return (
        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      );
    }
  };

  // Get availability status color
  const getAvailabilityColor = (slots: number) => {
    if (slots >= 5) return 'text-green-400'; // Green for high availability
    if (slots >= 2) return 'text-yellow-400'; // Yellow for medium availability
    return 'text-red-400'; // Red for low availability
  };

  return (
    <div className="rounded-2xl p-6 shadow-lg border border-[#475569]/50 relative overflow-hidden bg-[#1E293B]/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#F1F5F9]">Slot Availability</h2>
        <Button 
          onClick={onBookSlot}
          variant="outline"
          className="border-[#94A3B8] text-[#F1F5F9] hover:bg-[#475569]/50"
        >
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {availability.length > 0 ? (
          availability.slice(0, 3).map((station) => (
            <div
              key={station.stationId}
              className="bg-[#475569]/30 rounded-xl p-4 border border-[#64748B]/30 backdrop-blur-sm flex justify-between items-center"
            >
              <div className="flex items-center">
                <div className="mr-3">
                  {getStationIcon(station.stationName)}
                </div>
                <div>
                  <h3 className="font-semibold text-[#F1F5F9]">{station.stationName}</h3>
                  <p className="text-sm text-[#CBD5E1]">{station.location}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end mb-1">
                  <span className={`font-bold mr-2 ${getAvailabilityColor(station.slotsAvailable)}`}>
                    {station.slotsAvailable}
                  </span>
                  <span className="text-sm text-[#CBD5E1]">slots available</span>
                </div>
                <div className="text-sm text-[#CBD5E1]">Wait: {station.waitingTime}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-[#CBD5E1]">No slot availability data available</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Button
          onClick={onBookSlot}
          className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:from-[#7C3AED] hover:to-[#059669] text-white py-3"
        >
          Book a Slot
        </Button>
      </div>
    </div>
  );
};

export default SlotAvailabilityCard;