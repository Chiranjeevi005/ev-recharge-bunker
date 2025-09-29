import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { EnergyAnimation } from '@/components/ui/EnergyAnimation';

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
  return (
    <motion.div
      className="glass rounded-2xl p-6 shadow-lg border border-[#475569]/50 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.15)] pointer-events-none"></div>
      
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
          availability.slice(0, 3).map((station, index) => (
            <motion.div
              key={station.stationId}
              className="bg-[#475569]/30 rounded-xl p-4 border border-[#64748B]/30 backdrop-blur-sm flex justify-between items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
            >
              <div>
                <h3 className="font-semibold text-[#F1F5F9]">{station.stationName}</h3>
                <p className="text-sm text-[#CBD5E1]">{station.location}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end mb-1">
                  <span className="text-[#10B981] font-bold mr-2">{station.slotsAvailable}</span>
                  <span className="text-sm text-[#CBD5E1]">slots available</span>
                </div>
                <div className="text-sm text-[#CBD5E1]">Wait: {station.waitingTime}</div>
              </div>
            </motion.div>
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
    </motion.div>
  );
};

export default SlotAvailabilityCard;