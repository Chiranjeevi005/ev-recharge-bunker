import { PaymentService } from './payment';
import crypto from 'crypto';

// Mock environment variables
process.env['RAZORPAY_KEY_SECRET'] = 'test_secret';

// Mock MongoDB ObjectId
jest.mock('mongodb', () => ({
  ObjectId: jest.fn().mockImplementation((id) => ({
    toString: () => id || 'mock-object-id'
  }))
}));

// Mock Redis
jest.mock('@/lib/realtime/redis', () => ({
  __esModule: true,
  default: {
    isAvailable: jest.fn().mockReturnValue(true),
    get: jest.fn().mockResolvedValue(null),
    setex: jest.fn().mockResolvedValue(true)
  }
}));

// Mock Socket.IO
jest.mock('@/lib/realtime/socket', () => ({
  getIO: jest.fn().mockReturnValue({
    to: jest.fn().mockReturnValue({
      emit: jest.fn()
    })
  })
}));

// Create a mock collection with all the methods we need
const createMockCollection = () => ({
  insertOne: jest.fn().mockResolvedValue({
    insertedId: 'test-id'
  }),
  findOne: jest.fn().mockResolvedValue({
    _id: 'test-id',
    orderId: 'test-order-id',
    status: 'pending',
    paymentId: '',
    userId: 'test-user-id',
    stationId: 'test-station-id',
    slotId: 'test-slot-id',
    amount: 100,
    duration: 60,
    currency: 'INR',
    createdAt: new Date(),
    updatedAt: new Date()
  }),
  findOneAndUpdate: jest.fn().mockResolvedValue({
    value: {
      _id: 'test-id',
      orderId: 'test-order-id',
      status: 'completed',
      paymentId: 'test-payment-id',
      userId: 'test-user-id',
      stationId: 'test-station-id',
      slotId: 'test-slot-id',
      amount: 100,
      duration: 60,
      currency: 'INR',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }),
  updateOne: jest.fn().mockResolvedValue({
    modifiedCount: 1
  })
});

// Mock the database connection with a factory function to avoid initialization issues
jest.mock('@/lib/db/connection', () => ({
  connectToDatabase: jest.fn().mockImplementation(() => Promise.resolve({
    db: {
      collection: jest.fn().mockImplementation(() => createMockCollection())
    }
  }))
}));

describe('PaymentService', () => {
  let mockCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCollection = createMockCollection();
    
    // Reset the mock implementations
    const { connectToDatabase } = require('@/lib/db/connection');
    connectToDatabase.mockImplementation(() => Promise.resolve({
      db: {
        collection: jest.fn().mockImplementation(() => mockCollection)
      }
    }));
  });

  describe('verifyRazorpaySignature', () => {
    test('should return true for valid signature', async () => {
      const orderId = 'order_test';
      const paymentId = 'pay_test';
      const secret = process.env['RAZORPAY_KEY_SECRET'] || '';
      
      // Create a valid signature
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(`${orderId}|${paymentId}`);
      const validSignature = shasum.digest('hex');
      
      const result = await PaymentService.verifyRazorpaySignature(orderId, paymentId, validSignature);
      expect(result).toBe(true);
    });

    test('should return false for invalid signature', async () => {
      const orderId = 'order_test';
      const paymentId = 'pay_test';
      const invalidSignature = 'invalid_signature';
      
      const result = await PaymentService.verifyRazorpaySignature(orderId, paymentId, invalidSignature);
      expect(result).toBe(false);
    });

    test('should return false when secret is missing', async () => {
      // Temporarily remove the secret
      const originalSecret = process.env['RAZORPAY_KEY_SECRET'];
      delete process.env['RAZORPAY_KEY_SECRET'];
      
      const result = await PaymentService.verifyRazorpaySignature('order_test', 'pay_test', 'signature');
      expect(result).toBe(false);
      
      // Restore the secret
      process.env['RAZORPAY_KEY_SECRET'] = originalSecret;
    });
  });

  describe('createPayment', () => {
    test('should create a payment record', async () => {
      const paymentData = {
        userId: 'test-user-id',
        orderId: 'test-order-id',
        amount: 100,
        method: 'Razorpay',
        stationId: 'test-station-id',
        slotId: 'test-slot-id',
        duration: 60,
        currency: 'INR'
      };

      const result = await PaymentService.createPayment(paymentData);
      
      expect(result).toMatchObject({
        ...paymentData,
        paymentId: '',
        status: 'pending'
      });
      expect(result._id).toBe('test-id');
    });
  });

  describe('updatePaymentStatus', () => {
    test('should update payment status successfully', async () => {
      const result = await PaymentService.updatePaymentStatus('test-order-id', 'test-payment-id', 'completed');
      
      expect(result).toMatchObject({
        orderId: 'test-order-id',
        status: 'completed',
        paymentId: 'test-payment-id',
        userId: 'test-user-id',
        stationId: 'test-station-id',
        slotId: 'test-slot-id',
        amount: 100,
        duration: 60,
        currency: 'INR'
      });
    });

    test('should return null for invalid orderId', async () => {
      // Mock findOne to return null for invalid orderId
      mockCollection.findOne.mockResolvedValueOnce(null);
      
      const result = await PaymentService.updatePaymentStatus('', 'test-payment-id', 'completed');
      expect(result).toBeNull();
    });
  });
});