import { useRealTimeData } from '@/hooks/useRealTimeData';
import { renderHook, act } from '@testing-library/react';
import { io, Socket } from 'socket.io-client';

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    connect: jest.fn(),
  };
  
  return {
    io: jest.fn(() => mockSocket),
    Socket: jest.fn(() => mockSocket),
  };
});

describe('Dashboard Real-time Data', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize socket connection and handle real-time updates', () => {
    const { result } = renderHook(() => useRealTimeData());
    
    // Verify socket is initialized
    expect(io).toHaveBeenCalled();
    expect(result.current.socket).not.toBeNull();
    expect(result.current.isConnected).toBe(false); // Initially not connected
    
    // Simulate connection
    const mockResults = (io as jest.Mock).mock.results;
    if (mockResults && mockResults[0] && mockResults[0].value) {
      const connectCalls = mockResults[0].value.on.mock.calls;
      const connectHandlerCall = connectCalls.find((call: any[]) => call[0] === 'connect');
      if (connectHandlerCall) {
        const connectHandler = connectHandlerCall[1];
        act(() => {
          connectHandler();
        });
      }
    }
    
    expect(result.current.isConnected).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it('should handle client updates', () => {
    const { result } = renderHook(() => useRealTimeData());
    
    // Simulate client update event
    const mockResults = (io as jest.Mock).mock.results;
    if (mockResults && mockResults[0] && mockResults[0].value) {
      const clientUpdateCalls = mockResults[0].value.on.mock.calls;
      const clientUpdateHandlerCall = clientUpdateCalls.find((call: any[]) => call[0] === 'client-update');
      if (clientUpdateHandlerCall) {
        const clientUpdateHandler = clientUpdateHandlerCall[1];
        
        const clientUpdateData = {
          event: 'client_update',
          operationType: 'insert',
          documentKey: '123',
          fullDocument: {
            _id: '123',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'user',
            status: 'active'
          },
          timestamp: new Date().toISOString()
        };
        
        act(() => {
          clientUpdateHandler(clientUpdateData);
        });
        
        expect(result.current.updates).toHaveLength(1);
        expect(result.current.updates[0]).toEqual(clientUpdateData);
      }
    }
  });

  it('should handle station updates', () => {
    const { result } = renderHook(() => useRealTimeData());
    
    // Simulate station update event
    const mockResults = (io as jest.Mock).mock.results;
    if (mockResults && mockResults[0] && mockResults[0].value) {
      const stationUpdateCalls = mockResults[0].value.on.mock.calls;
      const stationUpdateHandlerCall = stationUpdateCalls.find((call: any[]) => call[0] === 'station-update');
      if (stationUpdateHandlerCall) {
        const stationUpdateHandler = stationUpdateHandlerCall[1];
        
        const stationUpdateData = {
          event: 'station_update',
          operationType: 'insert',
          documentKey: '456',
          fullDocument: {
            _id: '456',
            name: 'Test Station',
            address: '123 Test Street',
            city: 'Test City',
            status: 'active',
            totalSlots: 10,
            availableSlots: 5
          },
          timestamp: new Date().toISOString()
        };
        
        act(() => {
          stationUpdateHandler(stationUpdateData);
        });
        
        expect(result.current.updates).toHaveLength(1);
        expect(result.current.updates[0]).toEqual(stationUpdateData);
      }
    }
  });

  it('should handle payment updates', () => {
    const { result } = renderHook(() => useRealTimeData());
    
    // Simulate payment update event
    const mockResults = (io as jest.Mock).mock.results;
    if (mockResults && mockResults[0] && mockResults[0].value) {
      const paymentUpdateCalls = mockResults[0].value.on.mock.calls;
      const paymentUpdateHandlerCall = paymentUpdateCalls.find((call: any[]) => call[0] === 'payment-update');
      if (paymentUpdateHandlerCall) {
        const paymentUpdateHandler = paymentUpdateHandlerCall[1];
        
        const paymentUpdateData = {
          event: 'payment_update',
          operationType: 'insert',
          documentKey: '789',
          fullDocument: {
            _id: '789',
            userId: '123',
            stationId: '456',
            orderId: 'order123',
            amount: 100,
            status: 'completed',
            currency: 'INR'
          },
          timestamp: new Date().toISOString()
        };
        
        act(() => {
          paymentUpdateHandler(paymentUpdateData);
        });
        
        expect(result.current.updates).toHaveLength(1);
        expect(result.current.updates[0]).toEqual(paymentUpdateData);
      }
    }
  });

  it('should handle eco stats updates', () => {
    const { result } = renderHook(() => useRealTimeData());
    
    // Simulate eco stats update event
    const mockResults = (io as jest.Mock).mock.results;
    if (mockResults && mockResults[0] && mockResults[0].value) {
      const ecoStatsUpdateCalls = mockResults[0].value.on.mock.calls;
      const ecoStatsUpdateHandlerCall = ecoStatsUpdateCalls.find((call: any[]) => call[0] === 'eco-stats-update');
      if (ecoStatsUpdateHandlerCall) {
        const ecoStatsUpdateHandler = ecoStatsUpdateHandlerCall[1];
        
        const ecoStatsUpdateData = {
          event: 'eco_stats_update',
          operationType: 'update',
          documentKey: 'abc',
          fullDocument: {
            _id: 'abc',
            co2Saved: 1000,
            treesSaved: 50,
            energyConsumed: 5000
          },
          timestamp: new Date().toISOString()
        };
        
        act(() => {
          ecoStatsUpdateHandler(ecoStatsUpdateData);
        });
        
        expect(result.current.updates).toHaveLength(1);
        expect(result.current.updates[0]).toEqual(ecoStatsUpdateData);
      }
    }
  });

  it('should join user room', () => {
    const { result } = renderHook(() => useRealTimeData());
    const userId = 'user123';
    
    act(() => {
      result.current.joinUserRoom(userId);
    });
    
    const mockResults = (io as jest.Mock).mock.results;
    if (mockResults && mockResults[0] && mockResults[0].value) {
      expect(mockResults[0].value.emit).toHaveBeenCalledWith(
        'join-user-room',
        userId
      );
    }
  });

  it('should clear updates', () => {
    const { result } = renderHook(() => useRealTimeData());
    
    // Add some updates first
    const mockResults = (io as jest.Mock).mock.results;
    if (mockResults && mockResults[0] && mockResults[0].value) {
      const clientUpdateCalls = mockResults[0].value.on.mock.calls;
      const clientUpdateHandlerCall = clientUpdateCalls.find((call: any[]) => call[0] === 'client-update');
      if (clientUpdateHandlerCall) {
        const clientUpdateHandler = clientUpdateHandlerCall[1];
        
        act(() => {
          clientUpdateHandler({
            event: 'client_update',
            operationType: 'insert',
            documentKey: '123',
            fullDocument: { _id: '123', name: 'John Doe' },
            timestamp: new Date().toISOString()
          });
        });
        
        expect(result.current.updates).toHaveLength(1);
        
        // Clear updates
        act(() => {
          result.current.clearUpdates();
        });
        
        expect(result.current.updates).toHaveLength(0);
      }
    }
  });
});