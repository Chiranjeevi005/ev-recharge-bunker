import { connectToDatabase } from '@/lib/db/connection';
import redis from '@/lib/realtime/redisQueue';
import { getIO } from '@/lib/realtime/socket';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

// Add this interface for station data
interface Station {
  _id: string | ObjectId;
  name: string;
  // ... other station properties
}

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
  stationName?: string; // Add this field
}

export class PaymentService {
  static async verifyRazorpaySignature(razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string): Promise<boolean> {
    try {
      const secret = process.env['RAZORPAY_KEY_SECRET'];
      if (!secret) {
        console.error('Razorpay key secret not found in environment variables');
        return false;
      }
      
      // Additional validation
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        console.error('Missing required parameters for signature verification', {
          razorpay_order_id: !!razorpay_order_id,
          razorpay_payment_id: !!razorpay_payment_id,
          razorpay_signature: !!razorpay_signature
        });
        return false;
      }
      
      const signature = razorpay_signature;
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = shasum.digest('hex');
      
      const isValid = digest === signature;
      console.log('Signature verification result:', { isValid, digest, signature });
      
      return isValid;
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
        orderId: existingRecord['orderId'],
        userId: existingRecord['userId'],
        stationId: existingRecord['stationId'],
        slotId: existingRecord['slotId'],
        amount: existingRecord['amount'],
        duration: existingRecord['duration'],
        status: existingRecord['status'],
        paymentId: existingRecord['paymentId'],
        createdAt: existingRecord['createdAt']
      });
      
      // If the record already has the desired status and paymentId, return it
      if ((existingRecord as any).status === status && (existingRecord as any).paymentId === paymentId) {
        console.log(`Payment record already has desired status '${status}' and paymentId '${paymentId}'`);
        return {
          ...existingRecord,
          id: existingRecord._id.toString(),
          _id: existingRecord._id
        } as Payment;
      }
      
      // If the record already has the desired status but different paymentId, update the paymentId
      if (existingRecord['status'] === status && paymentId && !existingRecord['paymentId']) {
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
        
        if (!result || !(result as any).value) {
          console.error(`Failed to update paymentId for orderId: '${orderId}'`);
          return null;
        }
        
        console.log(`Successfully updated paymentId for orderId: '${orderId}'`);
        const updatedPayment = {
          ...result['value'],
          id: result['value']._id.toString(),
          _id: result['value']._id
        } as Payment;
        
        // Clear Redis cache for this user by setting a short TTL
        if (redis.isAvailable()) {
          try {
            await redis.setex(`payment:history:${updatedPayment.userId}`, 1, JSON.stringify([]));
            await redis.setex(`payment:history:all:${updatedPayment.userId}`, 1, JSON.stringify([]));
          } catch (redisError) {
            console.error("Error clearing Redis cache:", redisError);
          }
        }
        
        return updatedPayment;
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
      if (!result || !result['value']) {
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
            const updatedPayment = {
              ...updatedRecord,
              id: updatedRecord._id.toString(),
              _id: updatedRecord._id
            } as Payment;
            
            // Clear Redis cache for this user by setting a short TTL
            if (redis.isAvailable()) {
              try {
                await redis.setex(`payment:history:${updatedPayment.userId}`, 1, JSON.stringify([]));
                await redis.setex(`payment:history:all:${updatedPayment.userId}`, 1, JSON.stringify([]));
              } catch (redisError) {
                console.error("Error clearing Redis cache:", redisError);
              }
            }
            
            return updatedPayment;
          }
        } catch (directUpdateError) {
          console.error("Direct update also failed:", directUpdateError);
        }
        
        return null;
      }
      
      console.log(`Successfully updated payment status for orderId: '${orderId}'`);
      
      const updatedPayment = {
        ...(result as any).value,
        id: (result as any).value._id.toString(),
        _id: (result as any).value._id
      } as Payment;
      
      // Clear Redis cache for this user by setting a short TTL
      if (redis.isAvailable()) {
        try {
          // Clear both recent payments cache and all payments cache
          await redis.setex(`payment:history:${updatedPayment.userId}`, 1, JSON.stringify([]));
          await redis.setex(`payment:history:all:${updatedPayment.userId}`, 1, JSON.stringify([]));
        } catch (redisError) {
          console.error("Error clearing Redis cache:", redisError);
        }
      }
      
      return updatedPayment;
    } catch (error) {
      console.error("Error updating payment status:", error);
      return null;
    }
  }
  
  /**
   * Get payment history for a user (recent payments - limited to 5)
   */
  static async getPaymentHistory(userId: string, limit: number = 5): Promise<Payment[]> {
    // Try to fetch from Redis first (if available)
    if (redis.isAvailable()) {
      try {
        const paymentKey = `payment:history:${userId}`;
        const cachedPayments = await redis.get(paymentKey);
        
        if (cachedPayments) {
          console.log('PaymentService - Returning cached recent payments for user', userId);
          return JSON.parse(cachedPayments);
        }
      } catch (redisError) {
        console.error("Error fetching recent payments from Redis:", redisError);
      }
    }
    
    // If not in Redis or Redis not available, fetch from MongoDB
    const { db } = await connectToDatabase();
    const payments = await db.collection('payments')
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    
    console.log('PaymentService - Raw recent payments from DB for user', userId, ':', JSON.stringify(payments, null, 2));
    
    // Fetch station names for each payment only if stationName is not already set
    const enrichedPayments = await Promise.all(payments.map(async (payment: any) => {
      // Use existing stationName if available, otherwise try to fetch it
      let stationName = payment.stationName || 'Unknown Station';
      
      // Only try to fetch station info if stationName is still 'Unknown Station' and we have a stationId
      if (stationName === 'Unknown Station' && payment['stationId']) {
        try {
          // Try to fetch station information
          // First, try to find by ObjectId if stationId looks like an ObjectId
          if (typeof payment['stationId'] === 'string' && /^[0-9a-fA-F]{24}$/.test(payment['stationId'])) {
            // It looks like an ObjectId, try to find by ObjectId
            try {
              const station = await db.collection('stations').findOne({ _id: new ObjectId(payment['stationId']) });
              if (station) {
                stationName = station['name'];
              }
            } catch (objectIdError) {
              console.error("Error fetching station by ObjectId:", objectIdError);
            }
          }
          
          // If we still don't have a station name, try to find by string ID
          if (stationName === 'Unknown Station') {
            try {
              const station = await db.collection('stations').findOne({ _id: payment['stationId'] });
              if (station) {
                stationName = station['name'];
              }
            } catch (stringError) {
              console.error("Error fetching station with string ID:", stringError);
            }
          }
        } catch (error) {
          console.error("Error fetching station name for payment:", error);
        }
      }
      
      return {
        ...payment,
        stationName,
        id: payment._id.toString(),
        _id: payment._id
      };
    }));
    
    console.log('PaymentService - Enriched recent payments for user', userId, ':', JSON.stringify(enrichedPayments, null, 2));
    
    // Cache in Redis for 5 minutes (if available)
    if (redis.isAvailable()) {
      try {
        await redis.setex(`payment:history:${userId}`, 300, JSON.stringify(enrichedPayments));
      } catch (redisError) {
        console.error("Error caching recent payments in Redis:", redisError);
      }
    }
    
    return enrichedPayments as Payment[];
  }
  
  /**
   * Get all payment history for a user (complete history - no limit)
   */
  static async getAllPaymentHistory(userId: string): Promise<Payment[]> {
    // Try to fetch from Redis first (if available)
    if (redis.isAvailable()) {
      try {
        const paymentKey = `payment:history:all:${userId}`;
        const cachedPayments = await redis.get(paymentKey);
        
        if (cachedPayments) {
          console.log('PaymentService - Returning cached all payments for user', userId);
          return JSON.parse(cachedPayments);
        }
      } catch (redisError) {
        console.error("Error fetching all payments from Redis:", redisError);
      }
    }
    
    // If not in Redis or Redis not available, fetch from MongoDB
    const { db } = await connectToDatabase();
    const payments = await db.collection('payments')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log('PaymentService - Raw all payments from DB for user', userId, ':', JSON.stringify(payments, null, 2));
    
    // Fetch station names for each payment only if stationName is not already set
    const enrichedPayments = await Promise.all(payments.map(async (payment: any) => {
      // Use existing stationName if available, otherwise try to fetch it
      let stationName = payment.stationName || 'Unknown Station';
      
      // Only try to fetch station info if stationName is still 'Unknown Station' and we have a stationId
      if (stationName === 'Unknown Station' && payment['stationId']) {
        try {
          // Try to fetch station information
          // First, try to find by ObjectId if stationId looks like an ObjectId
          if (typeof payment['stationId'] === 'string' && /^[0-9a-fA-F]{24}$/.test(payment['stationId'])) {
            // It looks like an ObjectId, try to find by ObjectId
            try {
              const station = await db.collection('stations').findOne({ _id: new ObjectId(payment['stationId']) });
              if (station) {
                stationName = station['name'];
              }
            } catch (objectIdError) {
              console.error("Error fetching station by ObjectId:", objectIdError);
            }
          }
          
          // If we still don't have a station name, try to find by string ID
          if (stationName === 'Unknown Station') {
            try {
              const station = await db.collection('stations').findOne({ _id: payment['stationId'] });
              if (station) {
                stationName = station['name'];
              }
            } catch (stringError) {
              console.error("Error fetching station with string ID:", stringError);
            }
          }
        } catch (error) {
          console.error("Error fetching station name for payment:", error);
        }
      }
      
      return {
        ...payment,
        stationName,
        id: payment._id.toString(),
        _id: payment._id
      };
    }));
    
    console.log('PaymentService - Enriched all payments for user', userId, ':', JSON.stringify(enrichedPayments, null, 2));
    
    // Cache in Redis for 5 minutes (if available)
    if (redis.isAvailable()) {
      try {
        await redis.setex(`payment:history:all:${userId}`, 300, JSON.stringify(enrichedPayments));
      } catch (redisError) {
        console.error("Error caching all payments in Redis:", redisError);
      }
    }
    
    return enrichedPayments as Payment[];
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
          date: payment.updatedAt.toISOString(),
          stationName: payment.stationName || 'Unknown Station',
          orderId: payment.orderId,
          stationId: payment.stationId,
          slotId: payment.slotId,
          duration: payment.duration,
          currency: payment.currency
        },
        status: payment.status
      };
      
      // Emit to user room
      io.to(`user-${payment.userId}`).emit('payment-update', paymentUpdate);
      // Also emit to user-specific event
      io.to(`user-${payment.userId}`).emit('user-payment-update', paymentUpdate);
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