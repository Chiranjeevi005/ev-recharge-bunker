import { NextResponse } from 'next/server';
import { POST, PUT, DELETE } from '@/app/api/payments/route';
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

describe('Payments API', () => {
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

  describe('POST /api/payments', () => {
    it('should create a new payment successfully', async () => {
      const mockPayment = {
        userId: 'user123',
        stationId: 'station456',
        orderId: 'order789',
        amount: 100,
        status: 'completed',
        currency: 'INR',
        method: 'card'
      };

      const mockInsertResult = {
        insertedId: '12345'
      };

      mockDb.insertOne.mockResolvedValue(mockInsertResult);

      const request = {
        json: jest.fn().mockResolvedValue(mockPayment)
      };

      const response: any = await POST(request as any);
      const responseData = await response.json();

      expect(responseData.success).toBe(true);
      expect(responseData.id).toBe('12345');
      expect(mockDb.insertOne).toHaveBeenCalledWith({
        ...mockPayment,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });
  });

  describe('PUT /api/payments', () => {
    it('should update an existing payment successfully', async () => {
      const mockPayment = {
        userId: 'user123',
        stationId: 'station456',
        orderId: 'order789',
        amount: 150,
        status: 'refunded',
        currency: 'INR',
        method: 'card'
      };

      const mockUpdateResult = {
        ok: true,
        value: {
          _id: '12345',
          ...mockPayment
        }
      };

      mockDb.findOneAndUpdate.mockResolvedValue(mockUpdateResult);

      const request = {
        json: jest.fn().mockResolvedValue(mockPayment),
        url: 'http://localhost:3002/api/payments?id=12345'
      };

      const response: any = await PUT(request as any);
      const responseData = await response.json();

      expect(responseData.success).toBe(true);
      expect(responseData.data._id).toBe('12345');
      expect(mockDb.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(Object) },
        { 
          $set: {
            ...mockPayment,
            updatedAt: expect.any(Date)
          }
        },
        { returnDocument: 'after' }
      );
    });

    it('should return error if payment is not found', async () => {
      const mockPayment = {
        userId: 'user123',
        stationId: 'station456',
        orderId: 'order789',
        amount: 150,
        status: 'refunded',
        currency: 'INR',
        method: 'card'
      };

      const mockUpdateResult = {
        ok: false
      };

      mockDb.findOneAndUpdate.mockResolvedValue(mockUpdateResult);

      const request = {
        json: jest.fn().mockResolvedValue(mockPayment),
        url: 'http://localhost:3002/api/payments?id=12345'
      };

      const response: any = await PUT(request as any);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.error).toBe('Payment not found');
    });
  });

  describe('DELETE /api/payments', () => {
    it('should delete a payment successfully', async () => {
      const mockDeleteResult = {
        deletedCount: 1
      };

      mockDb.deleteOne.mockResolvedValue(mockDeleteResult);

      const request = {
        url: 'http://localhost:3002/api/payments?id=12345'
      };

      const response: any = await DELETE(request as any);
      const responseData = await response.json();

      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe('Payment deleted successfully');
      expect(mockDb.deleteOne).toHaveBeenCalledWith({ _id: expect.any(Object) });
    });

    it('should return error if payment is not found', async () => {
      const mockDeleteResult = {
        deletedCount: 0
      };

      mockDb.deleteOne.mockResolvedValue(mockDeleteResult);

      const request = {
        url: 'http://localhost:3002/api/payments?id=12345'
      };

      const response: any = await DELETE(request as any);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.error).toBe('Payment not found');
    });
  });
});