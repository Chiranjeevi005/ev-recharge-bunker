import { NextResponse } from 'next/server';

// Mock the database connection
const mockCollection = {
  findOne: jest.fn().mockResolvedValue(null),
  insertOne: jest.fn().mockResolvedValue({ insertedId: 'test-id' }),
  find: jest.fn().mockReturnThis(),
  project: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  toArray: jest.fn().mockResolvedValue([]),
  estimatedDocumentCount: jest.fn().mockResolvedValue(0),
  countDocuments: jest.fn().mockResolvedValue(0),
  deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
};

jest.mock('@/lib/db/connection', () => ({
  connectToDatabase: jest.fn().mockResolvedValue({
    db: {
      collection: jest.fn().mockReturnValue(mockCollection)
    }
  })
}));

// Mock Redis
jest.mock('@/lib/realtime/redisQueue', () => ({
  isAvailable: jest.fn().mockReturnValue(true),
  get: jest.fn().mockResolvedValue(null),
  setex: jest.fn().mockResolvedValue('OK'),
  enqueueMessage: jest.fn().mockResolvedValue('OK')
}));

// Mock validation
jest.mock('@/lib/db/schemas/validation', () => ({
  validateStation: jest.fn().mockReturnValue(true)
}));

describe('API Endpoints', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const { GET } = await import('@/app/api/health/route');
      const response = await GET();
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.service).toBe('EV Bunker Authentication System');
    });
  });
  
  describe('Stations API', () => {
    beforeEach(() => {
      // Reset mocks before each test
      jest.clearAllMocks();
    });
    
    it('should fetch stations', async () => {
      const { GET } = await import('@/app/api/stations/route');
      const request = new Request('http://localhost:3000/api/stations');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
    
    it('should create a new station', async () => {
      const { POST } = await import('@/app/api/stations/route');
      const request = new Request('http://localhost:3000/api/stations', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Station',
          address: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          country: 'Test Country',
          postalCode: '12345',
          location: {
            type: 'Point',
            coordinates: [0, 0]
          },
          status: 'active',
          totalSlots: 10,
          availableSlots: 10,
          slots: []
        })
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.id).toBeDefined();
    });
  });
});