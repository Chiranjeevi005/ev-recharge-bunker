import { NextResponse } from 'next/server';
import { POST, PUT, DELETE } from '@/app/api/stations/route';
import { connectToDatabase } from '@/lib/db/connection';
import redis from '@/lib/redis';

// Mock the database connection
jest.mock('@/lib/db/connection', () => ({
  connectToDatabase: jest.fn()
}));

// Mock Redis
jest.mock('@/lib/redis', () => ({
  __esModule: true,
  default: {
    isAvailable: jest.fn().mockReturnValue(true),
    publish: jest.fn().mockResolvedValue(1)
  }
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200
    }))
  }
}));

describe('Stations API', () => {
  const mockDb: any = {
    collection: jest.fn().mockReturnThis(),
    findOne: jest.fn(),
    insertOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    countDocuments: jest.fn()
  };

  beforeEach(() => {
    (connectToDatabase as jest.Mock).mockResolvedValue({ db: mockDb });
    jest.clearAllMocks();
  });

  describe('POST /api/stations', () => {
    it('should create a new station successfully', async () => {
      const mockStation = {
        name: 'Test Station',
        address: '123 Test Street',
        city: 'Test City',
        status: 'active',
        totalSlots: 10,
        availableSlots: 5,
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716]
        },
        pricing: {
          perKwh: 50,
          serviceCharge: 10
        },
        features: ['fast-charging', 'solar-powered']
      };

      const mockInsertResult = {
        insertedId: '12345'
      };

      mockDb.insertOne.mockResolvedValue(mockInsertResult);

      const request = {
        json: jest.fn().mockResolvedValue(mockStation)
      };

      const response: any = await POST(request as any);
      const responseData = await response.json();

      expect(responseData.success).toBe(true);
      expect(responseData.id).toBe('12345');
      expect(mockDb.insertOne).toHaveBeenCalledWith({
        ...mockStation,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });
  });

  describe('PUT /api/stations', () => {
    it('should update an existing station successfully', async () => {
      const mockStation = {
        name: 'Updated Station',
        address: '456 Updated Street',
        city: 'Updated City',
        status: 'maintenance',
        totalSlots: 15,
        availableSlots: 8,
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716]
        },
        pricing: {
          perKwh: 55,
          serviceCharge: 12
        },
        features: ['fast-charging', 'solar-powered', 'battery-swap']
      };

      const mockUpdateResult = {
        ok: true,
        value: {
          _id: '12345',
          ...mockStation
        }
      };

      mockDb.findOneAndUpdate.mockResolvedValue(mockUpdateResult);

      const request = {
        json: jest.fn().mockResolvedValue(mockStation),
        url: 'http://localhost:3002/api/stations?id=12345'
      };

      const response: any = await PUT(request as any);
      const responseData = await response.json();

      expect(responseData.success).toBe(true);
      expect(responseData.data._id).toBe('12345');
      expect(mockDb.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(Object) },
        { 
          $set: {
            ...mockStation,
            updatedAt: expect.any(Date)
          }
        },
        { returnDocument: 'after' }
      );
    });

    it('should return error if station is not found', async () => {
      const mockStation = {
        name: 'Updated Station',
        address: '456 Updated Street',
        city: 'Updated City',
        status: 'maintenance',
        totalSlots: 15,
        availableSlots: 8,
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716]
        },
        pricing: {
          perKwh: 55,
          serviceCharge: 12
        },
        features: ['fast-charging', 'solar-powered', 'battery-swap']
      };

      const mockUpdateResult = {
        ok: false
      };

      mockDb.findOneAndUpdate.mockResolvedValue(mockUpdateResult);

      const request = {
        json: jest.fn().mockResolvedValue(mockStation),
        url: 'http://localhost:3002/api/stations?id=12345'
      };

      const response: any = await PUT(request as any);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.error).toBe('Station not found');
    });
  });

  describe('DELETE /api/stations', () => {
    it('should delete a station successfully', async () => {
      const mockDeleteResult = {
        deletedCount: 1
      };

      mockDb.deleteOne.mockResolvedValue(mockDeleteResult);

      const request = {
        url: 'http://localhost:3002/api/stations?id=12345'
      };

      const response: any = await DELETE(request as any);
      const responseData = await response.json();

      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe('Station deleted successfully');
      expect(mockDb.deleteOne).toHaveBeenCalledWith({ _id: expect.any(Object) });
    });

    it('should return error if station is not found', async () => {
      const mockDeleteResult = {
        deletedCount: 0
      };

      mockDb.deleteOne.mockResolvedValue(mockDeleteResult);

      const request = {
        url: 'http://localhost:3002/api/stations?id=12345'
      };

      const response: any = await DELETE(request as any);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.error).toBe('Station not found');
    });
  });
});