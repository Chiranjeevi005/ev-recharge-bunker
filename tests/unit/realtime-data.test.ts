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
  on: jest.fn(),
  close: jest.fn()
};

const mockCollection = {
  watch: jest.fn().mockReturnValue(mockChangeStream),
  countDocuments: jest.fn().mockResolvedValue(0)
};

const mockDb = {
  collection: jest.fn().mockReturnValue(mockCollection),
  listCollections: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) })
};

// Mock database connection
jest.mock('@/lib/db/connection', () => ({
  connectToDatabase: jest.fn().mockResolvedValue({ db: mockDb })
}));

describe('Real-time Data Tracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('MongoDB Change Streams', () => {
    it('should initialize change streams for all collections', async () => {
      const result = await initializeChangeStreams();
      
      expect(result).toBe(true);
      expect(mockDb.collection).toHaveBeenCalledWith('clients');
      expect(mockDb.collection).toHaveBeenCalledWith('charging_sessions');
      expect(mockDb.collection).toHaveBeenCalledWith('payments');
      expect(mockDb.collection).toHaveBeenCalledWith('eco_stats');
      
      // Verify change stream events are set up
      expect(mockChangeStream.on).toHaveBeenCalledWith('change', expect.any(Function));
      expect(mockChangeStream.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockChangeStream.on).toHaveBeenCalledWith('end', expect.any(Function));
    });

    it('should handle client change events', async () => {
      // Set up the change stream to call the change handler
      let changeHandler: Function | undefined;
      mockChangeStream.on.mockImplementation((event, handler) => {
        if (event === 'change') {
          changeHandler = handler;
        }
      });

      await initializeChangeStreams();

      // Simulate a client change event
      const mockChange = {
        operationType: 'insert',
        documentKey: { _id: '12345' },
        fullDocument: {
          _id: '12345',
          name: 'John Doe',
          email: 'john@example.com'
        }
      };

      // Call the change handler if it was set
      if (changeHandler) {
        await changeHandler(mockChange);
      }

      // Verify Redis publish was called
      expect(redis.publish).toHaveBeenCalledWith(
        'client_activity_channel',
        expect.stringContaining('client_update')
      );
    });

    it('should handle payment change events', async () => {
      // Set up the change stream to call the change handler
      let changeHandler: Function | undefined;
      mockChangeStream.on.mockImplementation((event, handler) => {
        if (event === 'change') {
          changeHandler = handler;
        }
      });

      await initializeChangeStreams();

      // Simulate a payment change event
      const mockChange = {
        operationType: 'update',
        documentKey: { _id: '67890' },
        fullDocument: {
          _id: '67890',
          userId: 'user123',
          amount: 100,
          status: 'completed'
        }
      };

      // Call the change handler if it was set
      if (changeHandler) {
        await changeHandler(mockChange);
      }

      // Verify Redis publish was called
      expect(redis.publish).toHaveBeenCalledWith(
        'client_activity_channel',
        expect.stringContaining('payment_update')
      );
    });
  });
});