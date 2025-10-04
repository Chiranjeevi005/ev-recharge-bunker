import { connectToDatabase } from './db/connection';
import redis from './redis';
import { getIO } from './socket';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

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
  static async verifyRazorpaySignature(razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string): Promise<boolean> {
    try {
      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) {
        console.error('Razorpay key secret not found in environment variables');
        return false;
      }
      
      const signature = razorpay_signature;
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = shasum.digest('hex');
      
      return digest === signature;
    } catch (error) {
      console.error('Error verifying Razorpay signature:', error);
      return false;
    }
  }
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
    try {
      const { db } = await connectToDatabase();
      
      console.log(`Attempting to update payment status for orderId: '${orderId}'`);
      console.log("Type of orderId:", typeof orderId);
      
      // Validate orderId
      if (!orderId) {
        console.error("Invalid orderId provided");
        return null;
      }
      
      // First, check if the payment record already has the desired status
      const existingRecord = await db.collection('payments').findOne({ orderId: orderId });
      if (!existingRecord) {
        console.error(`Payment record not found for orderId: '${orderId}'`);
        return null;
      }
      
      console.log("Existing payment record:", {
        _id: existingRecord._id,
        orderId: existingRecord.orderId,
        userId: existingRecord.userId,
        stationId: existingRecord.stationId,
        slotId: existingRecord.slotId,
        amount: existingRecord.amount,
        duration: existingRecord.duration,
        status: existingRecord.status,
        paymentId: existingRecord.paymentId,
        createdAt: existingRecord.createdAt
      });
      
      // If the record already has the desired status and paymentId, return it
      if (existingRecord.status === status && existingRecord.paymentId === paymentId) {
        console.log(`Payment record already has desired status '${status}' and paymentId '${paymentId}'`);
        return {
          ...existingRecord,
          id: existingRecord._id.toString(),
          _id: existingRecord._id
        } as Payment;
      }
      
      // If the record already has the desired status but different paymentId, update the paymentId
      if (existingRecord.status === status && paymentId && !existingRecord.paymentId) {
        console.log(`Updating paymentId for record with existing status '${status}'`);
        const result = await db.collection('payments').findOneAndUpdate(
          { orderId: orderId },
          { 
            $set: { 
              paymentId: paymentId,
              updatedAt: new Date()
            } 
          },
          { returnDocument: 'after' }
        );
        
        console.log("findOneAndUpdate result for paymentId update:", result);
        
        if (!result || !result.value) {
          console.error(`Failed to update paymentId for orderId: '${orderId}'`);
          return null;
        }
        
        console.log(`Successfully updated paymentId for orderId: '${orderId}'`);
        return {
          ...result.value,
          id: result.value._id.toString(),
          _id: result.value._id
        } as Payment;
      }
      
      // Update the payment record
      console.log(`Updating payment status to '${status}' with paymentId '${paymentId}'`);
      const result = await db.collection('payments').findOneAndUpdate(
        { orderId: orderId },
        { 
          $set: { 
            paymentId: paymentId,
            status: status,
            updatedAt: new Date()
          } 
        },
        { returnDocument: 'after' }
      );
      
      console.log("findOneAndUpdate result for status update:", result);
      
      // Check if a document was found and updated
      // The result object has a 'value' property that contains the updated document
      if (!result || !result.value) {
        console.error(`Payment record not found for orderId: '${orderId}' after update attempt`);
        // Let's try one more time with a direct update operation
        try {
          const updateResult = await db.collection('payments').updateOne(
            { orderId: orderId },
            { 
              $set: { 
                paymentId: paymentId,
                status: status,
                updatedAt: new Date()
              } 
            }
          );
          
          console.log("Direct update result:", updateResult);
          
          // Now fetch the updated document
          const updatedRecord = await db.collection('payments').findOne({ orderId: orderId });
          if (updatedRecord) {
            console.log("Successfully updated payment record with direct update");
            return {
              ...updatedRecord,
              id: updatedRecord._id.toString(),
              _id: updatedRecord._id
            } as Payment;
          }
        } catch (directUpdateError) {
          console.error("Direct update also failed:", directUpdateError);
        }
        
        return null;
      }
      
      console.log(`Successfully updated payment status for orderId: '${orderId}'`);
      
      return {
        ...result.value,
        id: result.value._id.toString(),
        _id: result.value._id
      } as Payment;
    } catch (error) {
      console.error("Error updating payment status:", error);
      return null;
    }
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