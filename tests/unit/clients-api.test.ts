import { NextResponse } from 'next/server';
import { POST, PUT, DELETE } from '@/app/api/clients/route';
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

describe('Clients API', () => {
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

  describe('POST /api/clients', () => {
    it('should create a new client successfully', async () => {
      const mockClient = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'client',
        status: 'active'
      };

      const mockInsertResult = {
        insertedId: '12345'
      };

      mockDb.findOne.mockResolvedValue(null);
      mockDb.insertOne.mockResolvedValue(mockInsertResult);

      const request = {
        json: jest.fn().mockResolvedValue(mockClient)
      };

      const response: any = await POST(request as any);
      const responseData = await response.json();

      expect(responseData.success).toBe(true);
      expect(responseData.id).toBe('12345');
      expect(mockDb.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(mockDb.insertOne).toHaveBeenCalledWith({
        ...mockClient,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });

    it('should return error if client with email already exists', async () => {
      const mockClient = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'client',
        status: 'active'
      };

      const existingClient = {
        _id: '12345',
        email: 'john@example.com'
      };

      mockDb.findOne.mockResolvedValue(existingClient);

      const request = {
        json: jest.fn().mockResolvedValue(mockClient)
      };

      const response: any = await POST(request as any);
      const responseData = await response.json();

      expect(response.status).toBe(409);
      expect(responseData.error).toBe('Client with this email already exists');
    });
  });

  describe('PUT /api/clients', () => {
    it('should update an existing client successfully', async () => {
      const mockClient = {
        name: 'John Smith',
        email: 'johnsmith@example.com',
        role: 'client',
        status: 'active'
      };

      const mockUpdateResult = {
        ok: true,
        value: {
          _id: '12345',
          ...mockClient
        }
      };

      mockDb.findOneAndUpdate.mockResolvedValue(mockUpdateResult);

      const request = {
        json: jest.fn().mockResolvedValue(mockClient),
        url: 'http://localhost:3002/api/clients?id=12345'
      };

      const response: any = await PUT(request as any);
      const responseData = await response.json();

      expect(responseData.success).toBe(true);
      expect(responseData.data._id).toBe('12345');
      expect(mockDb.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(Object) },
        { 
          $set: {
            ...mockClient,
            updatedAt: expect.any(Date)
          }
        },
        { returnDocument: 'after' }
      );
    });

    it('should return error if client is not found', async () => {
      const mockClient = {
        name: 'John Smith',
        email: 'johnsmith@example.com',
        role: 'client',
        status: 'active'
      };

      const mockUpdateResult = {
        ok: false
      };

      mockDb.findOneAndUpdate.mockResolvedValue(mockUpdateResult);

      const request = {
        json: jest.fn().mockResolvedValue(mockClient),
        url: 'http://localhost:3002/api/clients?id=12345'
      };

      const response: any = await PUT(request as any);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.error).toBe('Client not found');
    });
  });

  describe('DELETE /api/clients', () => {
    it('should delete a client successfully', async () => {
      const mockDeleteResult = {
        deletedCount: 1
      };

      mockDb.deleteOne.mockResolvedValue(mockDeleteResult);

      const request = {
        url: 'http://localhost:3002/api/clients?id=12345'
      };

      const response: any = await DELETE(request as any);
      const responseData = await response.json();

      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe('Client deleted successfully');
      expect(mockDb.deleteOne).toHaveBeenCalledWith({ _id: expect.any(Object) });
    });

    it('should return error if client is not found', async () => {
      const mockDeleteResult = {
        deletedCount: 0
      };

      mockDb.deleteOne.mockResolvedValue(mockDeleteResult);

      const request = {
        url: 'http://localhost:3002/api/clients?id=12345'
      };

      const response: any = await DELETE(request as any);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.error).toBe('Client not found');
    });
  });
});