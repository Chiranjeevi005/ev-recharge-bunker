import { NextRequest, NextResponse } from 'next/server';
import { withRole, withPermission, withValidation } from '@/lib/middleware/rbac';
import { auth } from '@/lib/auth';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200
    })),
    next: jest.fn(() => ({
      status: 200
    }))
  }
}));

// Mock auth
jest.mock('@/lib/auth', () => ({
  auth: jest.fn()
}));

describe('RBAC Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Role-based Access Control', () => {
    it('should allow access for users with required role', async () => {
      // Mock authenticated user with admin role
      (auth as jest.Mock).mockResolvedValue({
        user: {
          id: '12345',
          role: 'admin'
        }
      });

      const middleware = await withRole('admin');
      const request = {} as NextRequest;
      
      const response = await middleware(request);
      
      expect(response?.status).toBe(200);
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('should deny access for users without required role', async () => {
      // Mock authenticated user with client role
      (auth as jest.Mock).mockResolvedValue({
        user: {
          id: '12345',
          role: 'client'
        }
      });

      const middleware = await withRole('admin');
      const request = {} as NextRequest;
      
      const response: any = await middleware(request);
      const responseData = await response.json();
      
      expect(response.status).toBe(403);
      expect(responseData.error).toBe('Insufficient permissions');
    });

    it('should deny access for unauthenticated users', async () => {
      // Mock unauthenticated user
      (auth as jest.Mock).mockResolvedValue(null);

      const middleware = await withRole('admin');
      const request = {} as NextRequest;
      
      const response: any = await middleware(request);
      const responseData = await response.json();
      
      expect(response.status).toBe(401);
      expect(responseData.error).toBe('Authentication required');
    });
  });

  describe('Permission-based Access Control', () => {
    it('should allow access for users with required permission', async () => {
      // Mock authenticated user with admin role (has write:clients permission)
      (auth as jest.Mock).mockResolvedValue({
        user: {
          id: '12345',
          role: 'admin'
        }
      });

      const middleware = await withPermission('write:clients');
      const request = {} as NextRequest;
      
      const response = await middleware(request);
      
      expect(response?.status).toBe(200);
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('should deny access for users without required permission', async () => {
      // Mock authenticated user with client role (does not have write:clients permission)
      (auth as jest.Mock).mockResolvedValue({
        user: {
          id: '12345',
          role: 'client'
        }
      });

      const middleware = await withPermission('write:clients');
      const request = {} as NextRequest;
      
      const response: any = await middleware(request);
      const responseData = await response.json();
      
      expect(response.status).toBe(403);
      expect(responseData.error).toBe('Insufficient permissions');
    });
  });

  describe('Input Validation', () => {
    it('should allow valid data', async () => {
      const mockSchema = {
        validate: jest.fn().mockReturnValue(true)
      };

      const middleware = withValidation(mockSchema);
      const request = {
        json: jest.fn().mockResolvedValue({ name: 'John Doe', email: 'john@example.com' })
      } as unknown as NextRequest;
      
      const response = await middleware(request);
      
      expect(response?.status).toBe(200);
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('should reject invalid data', async () => {
      const mockSchema = {
        validate: jest.fn().mockReturnValue(false)
      };

      const middleware = withValidation(mockSchema);
      const request = {
        json: jest.fn().mockResolvedValue({ invalid: 'data' })
      } as unknown as NextRequest;
      
      const response: any = await middleware(request);
      const responseData = await response.json();
      
      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Invalid input data');
    });
  });
});