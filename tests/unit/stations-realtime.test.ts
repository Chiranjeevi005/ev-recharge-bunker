import { initializeChangeStreams } from '@/lib/db/changeStreams';
import redis from '@/lib/redis';

// Mock Redis
jest.mock('@/lib/redis', () => ({
  __esModule: true,
  default: {
    isAvailable: jest.fn().mockReturnValue(true),
    publish: jest.fn().mockResolvedValue(1)
  }
}));

// Mock MongoDB Change Streams
const mockStationsChangeStream = {
  on: jest.fn(),
  close: jest.fn()
};

const mockStationsCollection = {
  watch: jest.fn().mockReturnValue(mockStationsChangeStream)
};

const mockDb = {
  collection: jest.fn().mockImplementation((name) => {
    if (name === 'stations') {
      return mockStationsCollection;
    }
    // Return a basic mock for other collections
    return {
      watch: jest.fn().mockReturnValue({
        on: jest.fn(),
        close: jest.fn()
      })
    };
  })
};

// Mock database connection
jest.mock('@/lib/db/connection', () => ({
  connectToDatabase: jest.fn().mockResolvedValue({ db: mockDb })
}));

describe('Stations Real-time Updates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize stations change stream', async () => {
    const result = await initializeChangeStreams();
    
    expect(result).toBe(true);
    expect(mockDb.collection).toHaveBeenCalledWith('stations');
    expect(mockStationsCollection.watch).toHaveBeenCalledWith(
      [], 
      expect.objectContaining({
        fullDocument: 'updateLookup'
      })
    );
  });

  it('should handle station change events and publish to Redis', async () => {
    // Set up handlers
    let changeHandler: Function | undefined;
    let errorHandler: Function | undefined;
    
    mockStationsChangeStream.on.mockImplementation((event, handler) => {
      if (event === 'change') {
        changeHandler = handler;
      } else if (event === 'error') {
        errorHandler = handler;
      }
    });

    await initializeChangeStreams();

    // Simulate a station insert event
    const mockChange = {
      operationType: 'insert',
      documentKey: { _id: 'station123' },
      fullDocument: {
        _id: 'station123',
        name: 'Test Station',
        address: '123 Test St',
        city: 'Test City',
        status: 'active',
        totalSlots: 10,
        availableSlots: 5
      }
    };

    // Trigger the change handler
    expect(changeHandler).toBeDefined();
    if (changeHandler) {
      await changeHandler(mockChange);
    }

    // Verify Redis publish was called with correct data
    expect(redis.publish).toHaveBeenCalledWith(
      'client_activity_channel',
      expect.stringContaining('"event":"station_update"')
    );
    expect(redis.publish).toHaveBeenCalledWith(
      'client_activity_channel',
      expect.stringContaining('"operationType":"insert"')
    );
    expect(redis.publish).toHaveBeenCalledWith(
      'client_activity_channel',
      expect.stringContaining('Test Station')
    );
  });

  it('should handle station update events', async () => {
    // Set up handlers
    let changeHandler: Function | undefined;
    
    mockStationsChangeStream.on.mockImplementation((event, handler) => {
      if (event === 'change') {
        changeHandler = handler;
      }
    });

    await initializeChangeStreams();

    // Simulate a station update event
    const mockChange = {
      operationType: 'update',
      documentKey: { _id: 'station123' },
      fullDocument: {
        _id: 'station123',
        name: 'Updated Station',
        address: '456 Updated St',
        city: 'Updated City',
        status: 'maintenance',
        totalSlots: 15,
        availableSlots: 3
      }
    };

    // Trigger the change handler
    expect(changeHandler).toBeDefined();
    if (changeHandler) {
      await changeHandler(mockChange);
    }

    // Verify Redis publish was called with correct data
    expect(redis.publish).toHaveBeenCalledWith(
      'client_activity_channel',
      expect.stringContaining('"event":"station_update"')
    );
    expect(redis.publish).toHaveBeenCalledWith(
      'client_activity_channel',
      expect.stringContaining('"operationType":"update"')
    );
    expect(redis.publish).toHaveBeenCalledWith(
      'client_activity_channel',
      expect.stringContaining('Updated Station')
    );
  });

  it('should handle station delete events', async () => {
    // Set up handlers
    let changeHandler: Function | undefined;
    
    mockStationsChangeStream.on.mockImplementation((event, handler) => {
      if (event === 'change') {
        changeHandler = handler;
      }
    });

    await initializeChangeStreams();

    // Simulate a station delete event
    const mockChange = {
      operationType: 'delete',
      documentKey: { _id: 'station123' }
    };

    // Trigger the change handler
    expect(changeHandler).toBeDefined();
    if (changeHandler) {
      await changeHandler(mockChange);
    }

    // Verify Redis publish was called with correct data
    expect(redis.publish).toHaveBeenCalledWith(
      'client_activity_channel',
      expect.stringContaining('"event":"station_update"')
    );
    expect(redis.publish).toHaveBeenCalledWith(
      'client_activity_channel',
      expect.stringContaining('"operationType":"delete"')
    );
  });
});