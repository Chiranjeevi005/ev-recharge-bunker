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

// Mock MongoDB
const mockChangeStream = {
  on: jest.fn((event, handler) => {
    // Simulate change events for testing
    if (event === 'change') {
      // We'll call this handler manually in our tests
    }
  }),
  close: jest.fn()
};

const mockCollection = {
  watch: jest.fn().mockReturnValue(mockChangeStream),
  countDocuments: jest.fn().mockResolvedValue(0)
};

const mockDb = {
  collection: jest.fn().mockImplementation((collectionName) => {
    // Return different mock data based on collection name if needed
    return mockCollection;
  }),
  listCollections: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) })
};

// Mock database connection
jest.mock('@/lib/db/connection', () => ({
  connectToDatabase: jest.fn().mockResolvedValue({ db: mockDb })
}));

describe('Real-time Dashboard Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('MongoDB Change Streams', () => {
    it('should initialize change streams for all collections including stations', async () => {
      const result = await initializeChangeStreams();
      
      expect(result).toBe(true);
      expect(mockDb.collection).toHaveBeenCalledWith('clients');
      expect(mockDb.collection).toHaveBeenCalledWith('stations'); // This is the key addition
      expect(mockDb.collection).toHaveBeenCalledWith('charging_sessions');
      expect(mockDb.collection).toHaveBeenCalledWith('payments');
      expect(mockDb.collection).toHaveBeenCalledWith('eco_stats');
      
      // Verify change stream events are set up
      expect(mockChangeStream.on).toHaveBeenCalledWith('change', expect.any(Function));
      expect(mockChangeStream.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockChangeStream.on).toHaveBeenCalledWith('end', expect.any(Function));
    });

    it('should publish station updates to Redis', async () => {
      // Set up the change stream to call the change handler
      let changeHandler: Function | undefined;
      mockChangeStream.on.mockImplementation((event, handler) => {
        if (event === 'change') {
          changeHandler = handler;
        }
      });

      await initializeChangeStreams();

      // Simulate a station change event
      const mockChange = {
        operationType: 'insert',
        documentKey: { _id: 'station123' },
        fullDocument: {
          _id: 'station123',
          name: 'Test Station',
          address: '123 Test Street',
          city: 'Test City',
          status: 'active',
          totalSlots: 10,
          availableSlots: 5
        }
      };

      // Call the change handler if it was set
      if (changeHandler) {
        await changeHandler(mockChange);
      }

      // Verify Redis publish was called
      expect(redis.publish).toHaveBeenCalledWith(
        'client_activity_channel',
        expect.stringContaining('station_update')
      );
    });
  });
});