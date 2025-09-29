import { connectToDatabase } from './db/connection';
import redis from './redis';
import { getIO } from './socket';
import { ObjectId } from 'mongodb';

export interface Payment {
  _id?: ObjectId;
  id?: string;
  userId: string;
  paymentId: string;
  orderId: string;
  amount: number;
  status: string;
  method: string;
  stationId: string;
  slotId: string;
  duration: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PaymentService {
  /**
   * Create a new payment record
   */
  static async createPayment(paymentData: Omit<Payment, 'paymentId' | 'status' | 'createdAt' | 'updatedAt' | '_id' | 'id'>): Promise<Payment> {
    const { db } = await connectToDatabase();
    
    const payment: Omit<Payment, '_id' | 'id'> = {
      ...paymentData,
      paymentId: '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('payments').insertOne(payment);
    
    return {
      ...payment,
      _id: result.insertedId
    } as Payment;
  }
  
  /**
   * Update payment status
   */
  static async updatePaymentStatus(orderId: string, paymentId: string, status: string): Promise<Payment | null> {
    const { db } = await connectToDatabase();
    
    const result = await db.collection('payments').findOneAndUpdate(
      { orderId },
      { 
        $set: { 
          paymentId,
          status,
          updatedAt: new Date()
        } 
      },
      { returnDocument: 'after' }
    );
    
    if (!result || !result.value) {
      return null;
    }
    
    return {
      ...result.value,
      id: result.value._id.toString(),
      _id: result.value._id
    };
  }
  
  /**
   * Get payment history for a user
   */
  static async getPaymentHistory(userId: string, limit: number = 10): Promise<Payment[]> {
    // Try to fetch from Redis first (if available)
    if (redis.isAvailable()) {
      try {
        const paymentKey = `payment:history:${userId}`;
        const cachedPayments = await redis.get(paymentKey);
        
        if (cachedPayments) {
          return JSON.parse(cachedPayments);
        }
      } catch (redisError) {
        console.error("Error fetching payments from Redis:", redisError);
      }
    }
    
    // If not in Redis or Redis not available, fetch from MongoDB
    const { db } = await connectToDatabase();
    const payments = await db.collection('payments')
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    
    // Convert ObjectId to string for JSON serialization
    const serializedPayments = payments.map(payment => ({
      ...payment,
      id: payment._id.toString(),
      _id: payment._id
    }));
    
    // Cache in Redis for 5 minutes (if available)
    if (redis.isAvailable()) {
      try {
        await redis.setex(`payment:history:${userId}`, 300, JSON.stringify(serializedPayments));
      } catch (redisError) {
        console.error("Error caching payments in Redis:", redisError);
      }
    }
    
    return serializedPayments as Payment[];
  }
  
  /**
   * Emit payment update via Socket.IO
   */
  static async emitPaymentUpdate(payment: Payment): Promise<void> {
    const io = getIO();
    if (io) {
      const paymentUpdate = {
        userId: payment.userId,
        payment: {
          userId: payment.userId,
          paymentId: payment.paymentId,
          amount: payment.amount,
          status: payment.status,
          method: payment.method || 'Razorpay',
          date: payment.updatedAt.toISOString()
        },
        status: payment.status
      };
      
      // Emit to user room
      io.to(`user-${payment.userId}`).emit('payment-update', paymentUpdate);
    }
  }
  
  /**
   * Process a successful payment
   */
  static async processSuccessfulPayment(orderId: string, paymentId: string, userId: string): Promise<void> {
    // Update payment status
    const updatedPayment = await this.updatePaymentStatus(orderId, paymentId, 'completed');
    
    if (updatedPayment) {
      // Emit real-time update
      await this.emitPaymentUpdate(updatedPayment);
    }
  }
}