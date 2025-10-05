import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Define types for our real-time data
interface ClientUpdate {
  event: 'client_update';
  operationType: 'insert' | 'update' | 'delete';
  documentKey: string;
  fullDocument?: any;
  timestamp: string;
}

interface ChargingSessionUpdate {
  event: 'charging_session_update';
  operationType: 'insert' | 'update' | 'delete';
  documentKey: string;
  fullDocument?: any;
  timestamp: string;
}

interface PaymentUpdate {
  event: 'payment_update';
  operationType: 'insert' | 'update' | 'delete';
  documentKey: string;
  fullDocument?: any;
  timestamp: string;
}

interface EcoStatsUpdate {
  event: 'eco_stats_update';
  operationType: 'insert' | 'update' | 'delete';
  documentKey: string;
  fullDocument?: any;
  timestamp: string;
}

type RealTimeUpdate = 
  | ClientUpdate 
  | ChargingSessionUpdate 
  | PaymentUpdate 
  | EcoStatsUpdate;

// Enhanced return type to include processed data
interface UseRealTimeDataReturn {
  socket: Socket | null;
  isConnected: boolean;
  updates: RealTimeUpdate[];
  joinUserRoom: (userId: string) => void;
  clearUpdates: () => void;
  data: any;
  loading: boolean;
  error: string | null;
}

export function useRealTimeData(): UseRealTimeDataReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [updates, setUpdates] = useState<RealTimeUpdate[]>([]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Socket.IO client
    const socketInstance = io({
      path: '/api/socketio',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('Connected to Socket.IO server');
      setIsConnected(true);
      setLoading(false);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      setIsConnected(false);
      setError('Connection error: ' + error.message);
      setLoading(false);
    });

    // Listen for real-time updates
    socketInstance.on('client-update', (data: ClientUpdate) => {
      console.log('Received client update:', data);
      setUpdates(prev => [...prev, data]);
      // Process client data if needed
    });

    socketInstance.on('charging-session-update', (data: ChargingSessionUpdate) => {
      console.log('Received charging session update:', data);
      setUpdates(prev => [...prev, data]);
      // Process session data if needed
    });

    socketInstance.on('payment-update', (data: PaymentUpdate) => {
      console.log('Received payment update:', data);
      setUpdates(prev => [...prev, data]);
      // Process payment data if needed
    });

    socketInstance.on('eco-stats-update', (data: EcoStatsUpdate) => {
      console.log('Received eco stats update:', data);
      setUpdates(prev => [...prev, data]);
      // Process stats data if needed
    });

    setSocket(socketInstance);

    // Cleanup function
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Function to join a user room
  const joinUserRoom = (userId: string) => {
    if (socket) {
      socket.emit('join-user-room', userId);
      console.log(`Joined user room: user-${userId}`);
    }
  };

  // Function to clear updates
  const clearUpdates = () => {
    setUpdates([]);
  };

  return {
    socket,
    isConnected,
    updates,
    joinUserRoom,
    clearUpdates,
    data,
    loading,
    error
  };
}