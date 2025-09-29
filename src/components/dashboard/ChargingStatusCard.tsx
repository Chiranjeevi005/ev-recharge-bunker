import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface ChargingSession {
  userId: string;
  stationId: string;
  slotId: string;
  startTime: string;
  endTime: string;
  totalEnergyKWh: number;
  totalCost: number;
  paymentStatus: string;
  location: string;
  progress: number;
  timeRemaining: number;
  energyConsumed: number;
}

interface ChargingStatusCardProps {
  session: ChargingSession | null;
  onCancelSession: () => void;
}

const ChargingStatusCard: React.FC<ChargingStatusCardProps> = ({ session, onCancelSession }) => {
  if (!session) {
    return (
      <motion.div
        className="glass rounded-2xl p-8 text-center shadow-lg border border-[#475569]/50 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.15)] pointer-events-none"></div>
        
        <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2">No Active Charging Session</h2>
        <p className="text-[#CBD5E1] mb-6">
          You don't have any active charging sessions right now
        </p>
        <Button
          onClick={() => window.location.href = "/find-bunks"}
          className="bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:from-[#7C3AED] hover:to-[#059669] text-white px-6 py-3"
        >
          Find a Charging Station
        </Button>
      </motion.div>
    );
  }

  // Format time for display
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="glass rounded-2xl p-6 shadow-lg relative overflow-hidden border border-[#475569]/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.15)] pointer-events-none"></div>
      
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8B5CF6] to-[#10B981]"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2">Active Charging Session</h2>
          <p className="text-[#CBD5E1]">Your EV is currently charging</p>
        </div>
        <div className="mt-4 md:mt-0">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900/50 text-green-400 border border-green-800/50">
            <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
            Charging
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-[#475569]/30 rounded-xl p-5 border border-[#64748B]/30 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-[#F1F5F9] mb-3">Station Details</h3>
          <div className="space-y-2">
            <p className="text-[#F1F5F9] font-medium">Delhi Metro Station</p>
            <p className="text-[#CBD5E1] text-sm">Rajiv Chowk, New Delhi</p>
            <p className="text-[#CBD5E1] text-sm">Slot: {session.slotId}</p>
          </div>
        </div>

        <div className="bg-[#475569]/30 rounded-xl p-5 border border-[#64748B]/30 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-[#F1F5F9] mb-3">Session Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[#CBD5E1]">Start Time:</span>
              <span className="text-[#F1F5F9]">
                {new Date(session.startTime).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#CBD5E1]">End Time:</span>
              <span className="text-[#F1F5F9]">
                {new Date(session.endTime).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#CBD5E1]">Amount:</span>
              <span className="text-[#10B981] font-bold">₹{session.totalCost}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#475569]/30 rounded-xl p-5 border border-[#64748B]/30 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="relative w-32 h-32 mb-4">
            {/* Circular progress bar */}
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#475569"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#10B981"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${session.progress * 2.83} 283`}
                className="transition-all duration-1000 ease-in-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-[#F1F5F9]">{session.progress}%</span>
              <span className="text-sm text-[#CBD5E1]">Complete</span>
            </div>
          </div>
          <p className="text-[#CBD5E1] text-center">Charging Progress</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#475569]/30 to-[#334155]/30 rounded-xl p-5 border border-[#64748B]/30 backdrop-blur-sm mb-6">
        <h3 className="text-lg font-semibold text-[#F1F5F9] mb-3">Real-time Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#10B981]">{session.energyConsumed.toFixed(2)} kWh</div>
            <p className="text-[#CBD5E1] text-sm">Energy Consumed</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#8B5CF6]">₹{(session.energyConsumed * 15).toFixed(2)}</div>
            <p className="text-[#CBD5E1] text-sm">Estimated Cost</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#F59E0B]">{formatTime(session.timeRemaining)}</div>
            <p className="text-[#CBD5E1] text-sm">Time Remaining</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button
          onClick={onCancelSession}
          variant="outline"
          className="border-[#EF4444] text-[#F87171] hover:bg-[#7F1D1D]/50 px-6 py-3"
        >
          Cancel Session
        </Button>
      </div>
    </motion.div>
  );
};

export default ChargingStatusCard;