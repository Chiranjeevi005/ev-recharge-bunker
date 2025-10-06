import { connectToDatabase, closeDatabaseConnection, getDatabase } from './connection';
import { MongoClient } from 'mongodb';

// Mock MongoDB
const mockDb = { dbName: 'test-db' };
const mockClient = {
  connect: jest.fn(),
  db: jest.fn(() => mockDb),
  close: jest.fn()
};

jest.mock('mongodb', () => {
  return {
    MongoClient: jest.fn(() => mockClient)
  };
});

describe('connectToDatabase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should connect to database successfully', async () => {
    mockClient.connect.mockResolvedValue(undefined);
    
    const result = await connectToDatabase(1, 0);
    
    expect(MongoClient).toHaveBeenCalledWith(
      process.env['MONGODB_URI'] || 'mongodb://localhost:27017',
      expect.objectContaining({
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
      })
    );
    expect(mockClient.connect).toHaveBeenCalled();
    expect(result.client).toBe(mockClient);
    expect(result.db).toBe(mockDb);
  });

  it('should retry on connection failure', async () => {
    mockClient.connect
      .mockRejectedValueOnce(new Error('Connection failed'))
      .mockResolvedValueOnce(undefined);
    
    const result = await connectToDatabase(2, 10); // 2 retries, 10ms delay
    
    expect(mockClient.connect).toHaveBeenCalledTimes(2);
    expect(result.client).toBe(mockClient);
    expect(result.db).toBe(mockDb);
  });

  it('should throw error after max retries exceeded', async () => {
    mockClient.connect.mockRejectedValue(new Error('Connection failed'));
    
    await expect(connectToDatabase(2, 0))
      .rejects
      .toThrow('Failed to connect to MongoDB after 2 attempts: Error: Connection failed');
  });
});

describe('closeDatabaseConnection', () => {
  it('should close database connection', async () => {
    // First connect to have something to close
    mockClient.connect.mockResolvedValue(undefined);
    await connectToDatabase(1, 0);
    
    mockClient.close.mockResolvedValue(undefined);
    await closeDatabaseConnection();
    
    expect(mockClient.close).toHaveBeenCalled();
  });
});

describe('getDatabase', () => {
  it('should return cached database instance', async () => {
    // First connect to have a cached database
    mockClient.connect.mockResolvedValue(undefined);
    await connectToDatabase(1, 0);
    
    const db = getDatabase();
    expect(db).toBe(mockDb);
  });

  it('should throw error if database not connected', () => {
    // Clear any existing cached connection
    jest.resetModules();
    
    expect(() => getDatabase())
      .toThrow('Database not connected. Call connectToDatabase first.');
  });
});