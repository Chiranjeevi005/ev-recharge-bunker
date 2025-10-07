import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// Define types for our real-time data
interface ClientUpdate {
  event: 'client_update';
  operationType: 'insert' | 'update' | 'delete';
  documentKey: string;
  fullDocument?: any;
  timestamp: string;
}

interface StationUpdate {
  event: 'station_update';
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
  | StationUpdate
  | ChargingSessionUpdate 
  | PaymentUpdate 
  | EcoStatsUpdate;

// Define data structure
interface RealTimeData {
  clients: any[];
  stations: any[];
  chargingSessions: any[];
  payments: any[];
  ecoStats: any[];
  activityLog: any[];
}

// Enhanced return type to include processed data
interface UseRealTimeDataReturn {
  socket: Socket | null;
  isConnected: boolean;
  updates: RealTimeUpdate[];
  joinUserRoom: (userId: string) => void;
  clearUpdates: () => void;
  data: RealTimeData;
  loading: boolean;
  error: string | null;
}

export function useRealTimeData(): UseRealTimeDataReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [updates, setUpdates] = useState<RealTimeUpdate[]>([]);
  const [data, setData] = useState<RealTimeData>({
    clients: [],
    stations: [],
    chargingSessions: [],
    payments: [],
    ecoStats: [],
    activityLog: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isChangeStreamsAvailableRef = useRef<boolean>(true);
  const reconnectAttemptsRef = useRef<number>(0);
  const maxReconnectAttempts = 5;
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to fetch initial data
  const fetchInitialData = async () => {
    try {
      // Add timeout to each fetch request
      const fetchWithTimeout = async (url: string, timeout = 10000) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);
          return response;
        } catch (err) {
          clearTimeout(timeoutId);
          throw err;
        }
      };

      // Fetch clients
      try {
        const clientsRes = await fetchWithTimeout('/api/clients');
        if (clientsRes.ok) {
          const clientsData = await clientsRes.json();
          setData(prev => ({ ...prev, clients: clientsData.data || [] }));
        }
      } catch (err) {
        console.error('Error fetching clients:', err);
      }

      // Fetch stations
      try {
        const stationsRes = await fetchWithTimeout('/api/stations');
        if (stationsRes.ok) {
          const stationsData = await stationsRes.json();
          setData(prev => ({ ...prev, stations: stationsData.data || [] }));
        }
      } catch (err) {
        console.error('Error fetching stations:', err);
      }

      // Fetch payments
      try {
        const paymentsRes = await fetchWithTimeout('/api/payments');
        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          setData(prev => ({ ...prev, payments: paymentsData.data || [] }));
        }
      } catch (err) {
        console.error('Error fetching payments:', err);
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  // Function to fetch updated stats
  const fetchUpdatedStats = async () => {
    try {
      // Fetch updated stats with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const statsRes = await fetch('/api/dashboard/stats', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (statsRes.ok) {
          // We'll handle stats updates in the dashboard component
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.error('Error fetching updated stats:', err);
      }
    } catch (err) {
      console.error('Error fetching updated stats:', err);
    }
  };

  useEffect(() => {
    let socketInstance: Socket | null = null;
    
    const connectSocket = () => {
      // Clear any existing timeout
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      
      // Set a timeout for the connection attempt
      connectionTimeoutRef.current = setTimeout(() => {
        console.error('Socket.IO connection timeout');
        setIsConnected(false);
        setError('Connection timeout - please refresh the page');
        setLoading(false);
        
        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          setTimeout(connectSocket, 1000 * reconnectAttemptsRef.current); // Exponential backoff
        }
      }, 15000); // 15 second connection timeout
      
      // Initialize Socket.IO client with improved configuration
      socketInstance = io({
        path: '/api/socketio',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        randomizationFactor: 0.5,
        timeout: 10000, // 10 second timeout for connection
        autoConnect: true,
        forceNew: true // Force new connection to avoid cached connections
      });

      socketInstance.on('connect', () => {
        console.log('Connected to Socket.IO server');
        // Clear connection timeout on successful connection
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
        setIsConnected(true);
        setLoading(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('Disconnected from Socket.IO server:', reason);
        setIsConnected(false);
        
        // Clear connection timeout on disconnect
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
        
        // Attempt to reconnect if not manually disconnected
        if (reason !== 'io client disconnect' && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          setTimeout(connectSocket, 1000 * reconnectAttemptsRef.current); // Exponential backoff
        }
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        // Clear connection timeout on error
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
        setIsConnected(false);
        setError('Connection error: ' + error.message);
        setLoading(false);
        
        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          setTimeout(connectSocket, 1000 * reconnectAttemptsRef.current); // Exponential backoff
        }
      });

      socketInstance.on('connect_timeout', (timeout) => {
        console.error('Socket.IO connection timeout:', timeout);
        // Clear connection timeout on timeout
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
        setIsConnected(false);
        setError('Connection timeout');
        setLoading(false);
      });

      // Listen for real-time updates
      socketInstance.on('client-update', (updateData: ClientUpdate) => {
        console.log('Received client update:', updateData);
        setUpdates(prev => [...prev, updateData]);
        // Update clients data
        setData(prev => {
          const clients = [...prev.clients];
          if (updateData.fullDocument) {
            const existingIndex = clients.findIndex(c => c._id === updateData.fullDocument._id);
            if (existingIndex >= 0) {
              clients[existingIndex] = updateData.fullDocument;
            } else {
              clients.push(updateData.fullDocument);
            }
          }
          // Add to activity log
          const activityLog = [...prev.activityLog, updateData];
          return { ...prev, clients, activityLog };
        });
        
        // If we receive a real update, change streams are working
        isChangeStreamsAvailableRef.current = true;
        // Clear polling interval if it exists
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      });

      socketInstance.on('station-update', (updateData: StationUpdate) => {
        console.log('Received station update:', updateData);
        setUpdates(prev => [...prev, updateData]);
        // Update stations data
        setData(prev => {
          const stations = [...prev.stations];
          if (updateData.fullDocument) {
            const existingIndex = stations.findIndex(s => s._id === updateData.fullDocument._id);
            if (existingIndex >= 0) {
              stations[existingIndex] = updateData.fullDocument;
            } else {
              stations.push(updateData.fullDocument);
            }
          }
          // Add to activity log
          const activityLog = [...prev.activityLog, updateData];
          return { ...prev, stations, activityLog };
        });
        
        // If we receive a real update, change streams are working
        isChangeStreamsAvailableRef.current = true;
        // Clear polling interval if it exists
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      });

      socketInstance.on('charging-session-update', (updateData: ChargingSessionUpdate) => {
        console.log('Received charging session update:', updateData);
        setUpdates(prev => [...prev, updateData]);
        // Update charging sessions data
        setData(prev => {
          const chargingSessions = [...prev.chargingSessions];
          if (updateData.fullDocument) {
            const existingIndex = chargingSessions.findIndex(cs => cs._id === updateData.fullDocument._id);
            if (existingIndex >= 0) {
              chargingSessions[existingIndex] = updateData.fullDocument;
            } else {
              chargingSessions.push(updateData.fullDocument);
            }
          }
          // Add to activity log
          const activityLog = [...prev.activityLog, updateData];
          return { ...prev, chargingSessions, activityLog };
        });
        
        // If we receive a real update, change streams are working
        isChangeStreamsAvailableRef.current = true;
        // Clear polling interval if it exists
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      });

      socketInstance.on('payment-update', (updateData: PaymentUpdate) => {
        console.log('Received payment update:', updateData);
        setUpdates(prev => [...prev, updateData]);
        // Update payments data
        setData(prev => {
          const payments = [...prev.payments];
          if (updateData.fullDocument) {
            const existingIndex = payments.findIndex(p => p._id === updateData.fullDocument._id);
            if (existingIndex >= 0) {
              payments[existingIndex] = updateData.fullDocument;
            } else {
              payments.push(updateData.fullDocument);
            }
          }
          // Add to activity log
          const activityLog = [...prev.activityLog, updateData];
          return { ...prev, payments, activityLog };
        });
        
        // If we receive a real update, change streams are working
        isChangeStreamsAvailableRef.current = true;
        // Clear polling interval if it exists
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      });

      socketInstance.on('eco-stats-update', (updateData: EcoStatsUpdate) => {
        console.log('Received eco stats update:', updateData);
        setUpdates(prev => [...prev, updateData]);
        // Update eco stats data
        setData(prev => {
          const ecoStats = [...prev.ecoStats];
          if (updateData.fullDocument) {
            const existingIndex = ecoStats.findIndex(es => es._id === updateData.fullDocument._id);
            if (existingIndex >= 0) {
              ecoStats[existingIndex] = updateData.fullDocument;
            } else {
              ecoStats.push(updateData.fullDocument);
            }
          }
          // Add to activity log
          const activityLog = [...prev.activityLog, updateData];
          return { ...prev, ecoStats, activityLog };
        });
        
        // If we receive a real update, change streams are working
        isChangeStreamsAvailableRef.current = true;
        // Clear polling interval if it exists
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      });

      // Handle any general update events
      socketInstance.on('update', (updateData: any) => {
        console.log('Received general update:', updateData);
        setUpdates(prev => [...prev, updateData]);
        // Add to activity log
        setData(prev => {
          const activityLog = [...prev.activityLog, updateData];
          return { ...prev, activityLog };
        });
      });

      setSocket(socketInstance);

      // Fetch initial data
      fetchInitialData();
    };

    // Connect to socket
    connectSocket();

    // Set up polling as fallback
    setTimeout(() => {
      // If we haven't received any real-time updates after 5 seconds, assume change streams aren't working
      if (isChangeStreamsAvailableRef.current && !pollingIntervalRef.current) {
        console.log('Change streams may not be available, setting up polling fallback...');
        isChangeStreamsAvailableRef.current = false;
        
        // Set up polling interval
        pollingIntervalRef.current = setInterval(() => {
          fetchInitialData();
          fetchUpdatedStats();
        }, 30000); // Poll every 30 seconds (increased from 10)
      }
    }, 5000);

    // Cleanup function
    return () => {
      // Clear connection timeout
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      
      if (socketInstance) {
        socketInstance.disconnect();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
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