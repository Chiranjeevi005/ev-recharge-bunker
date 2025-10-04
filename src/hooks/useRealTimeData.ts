import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

// Define types for our real-time data
interface ClientUpdateEvent {
  event: 'client_update';
  operationType: string;
  documentKey: string;
  fullDocument: any;
  timestamp: string;
}

interface ChargingSessionUpdateEvent {
  event: 'charging_session_update';
  operationType: string;
  documentKey: string;
  fullDocument: any;
  timestamp: string;
}

interface PaymentUpdateEvent {
  event: 'payment_update';
  operationType: string;
  documentKey: string;
  fullDocument: any;
  timestamp: string;
}

interface EcoStatsUpdateEvent {
  event: 'eco_stats_update';
  operationType: string;
  documentKey: string;
  fullDocument: any;
  timestamp: string;
}

type RealTimeEvent = 
  | ClientUpdateEvent 
  | ChargingSessionUpdateEvent 
  | PaymentUpdateEvent 
  | EcoStatsUpdateEvent;

interface RealTimeData {
  clients: any[];
  chargingSessions: any[];
  payments: any[];
  ecoStats: any[];
  activityLog: RealTimeEvent[];
}

export const useRealTimeData = () => {
  const [data, setData] = useState<RealTimeData>({
    clients: [],
    chargingSessions: [],
    payments: [],
    ecoStats: [],
    activityLog: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const socket = io({ path: '/api/socketio' });

  // Function to add events to activity log with timestamp-based ordering
  const addToActivityLog = useCallback((event: RealTimeEvent) => {
    setData(prev => {
      const newLog = [...prev.activityLog, event].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, 50); // Keep only the latest 50 events
      
      return {
        ...prev,
        activityLog: newLog
      };
    });
  }, []);

  useEffect(() => {
    // Connect to WebSocket
    socket.on('connect', () => {
      console.log('Connected to real-time server');
      setLoading(false);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from real-time server');
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Failed to connect to real-time server');
      setLoading(false);
    });

    // Handle client updates
    socket.on('client-update', (event: ClientUpdateEvent) => {
      console.log('Client update received:', event);
      addToActivityLog(event);
      
      // Update clients list
      if (event.operationType === 'insert' || event.operationType === 'replace') {
        setData(prev => ({
          ...prev,
          clients: [...prev.clients, event.fullDocument]
        }));
      } else if (event.operationType === 'update') {
        setData(prev => ({
          ...prev,
          clients: prev.clients.map(client => 
            client.id === event.documentKey ? { ...client, ...event.fullDocument } : client
          )
        }));
      } else if (event.operationType === 'delete') {
        setData(prev => ({
          ...prev,
          clients: prev.clients.filter(client => client.id !== event.documentKey)
        }));
      }
    });

    // Handle charging session updates
    socket.on('charging-session-update', (event: ChargingSessionUpdateEvent) => {
      console.log('Charging session update received:', event);
      addToActivityLog(event);
      
      // Update charging sessions list
      if (event.operationType === 'insert' || event.operationType === 'replace') {
        setData(prev => ({
          ...prev,
          chargingSessions: [...prev.chargingSessions, event.fullDocument]
        }));
      } else if (event.operationType === 'update') {
        setData(prev => ({
          ...prev,
          chargingSessions: prev.chargingSessions.map(session => 
            session.id === event.documentKey ? { ...session, ...event.fullDocument } : session
          )
        }));
      } else if (event.operationType === 'delete') {
        setData(prev => ({
          ...prev,
          chargingSessions: prev.chargingSessions.filter(session => session.id !== event.documentKey)
        }));
      }
    });

    // Handle payment updates
    socket.on('payment-update', (event: PaymentUpdateEvent) => {
      console.log('Payment update received:', event);
      addToActivityLog(event);
      
      // Update payments list
      if (event.operationType === 'insert' || event.operationType === 'replace') {
        setData(prev => ({
          ...prev,
          payments: [...prev.payments, event.fullDocument]
        }));
      } else if (event.operationType === 'update') {
        setData(prev => ({
          ...prev,
          payments: prev.payments.map(payment => 
            payment.id === event.documentKey ? { ...payment, ...event.fullDocument } : payment
          )
        }));
      } else if (event.operationType === 'delete') {
        setData(prev => ({
          ...prev,
          payments: prev.payments.filter(payment => payment.id !== event.documentKey)
        }));
      }
    });

    // Handle eco stats updates
    socket.on('eco-stats-update', (event: EcoStatsUpdateEvent) => {
      console.log('Eco stats update received:', event);
      addToActivityLog(event);
      
      // Update eco stats list
      if (event.operationType === 'insert' || event.operationType === 'replace') {
        setData(prev => ({
          ...prev,
          ecoStats: [...prev.ecoStats, event.fullDocument]
        }));
      } else if (event.operationType === 'update') {
        setData(prev => ({
          ...prev,
          ecoStats: prev.ecoStats.map(stat => 
            stat.id === event.documentKey ? { ...stat, ...event.fullDocument } : stat
          )
        }));
      } else if (event.operationType === 'delete') {
        setData(prev => ({
          ...prev,
          ecoStats: prev.ecoStats.filter(stat => stat.id !== event.documentKey)
        }));
      }
    });

    // Initial data fetch
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch initial data from API endpoints
        const [clientsRes, sessionsRes, paymentsRes, ecoStatsRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/dashboard/sessions'),
          fetch('/api/dashboard/payments'),
          fetch('/api/dashboard/environmental-impact')
        ]);

        const clients = clientsRes.ok ? await clientsRes.json() : [];
        const sessions = sessionsRes.ok ? await sessionsRes.json() : [];
        const payments = paymentsRes.ok ? await paymentsRes.json() : [];
        const ecoStats = ecoStatsRes.ok ? await ecoStatsRes.json() : [];

        setData({
          clients,
          chargingSessions: sessions,
          payments,
          ecoStats,
          activityLog: []
        });
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to fetch initial data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('client-update');
      socket.off('charging-session-update');
      socket.off('payment-update');
      socket.off('eco-stats-update');
      socket.disconnect();
    };
  }, [addToActivityLog]);

  return { data, loading, error, socket };
};