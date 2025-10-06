import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';
import { validatePayment } from '@/lib/db/schemas/validation';
import { PaymentService } from '@/lib/payment';
import redis from '@/lib/realtime/redisQueue';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const stationId = searchParams.get('stationId');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    
    // Special case: if userId is provided and limit is high, use getAllPaymentHistory
    if (userId && limit >= 1000) {
      // Fetch all payments for the user without pagination
      const payments = await PaymentService.getAllPaymentHistory(userId);
      
      // Apply status filter if provided
      const filteredPayments = status 
        ? payments.filter(payment => payment.status === status)
        : payments;
      
      // Apply stationId filter if provided
      const finalPayments = stationId 
        ? filteredPayments.filter(payment => payment.stationId === stationId)
        : filteredPayments;
      
      // Sort the results
      const validSortFields = ['createdAt', 'amount', 'status'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
      
      finalPayments.sort((a: any, b: any) => {
        if (sortOrder === 1) {
          return a[sortField] > b[sortField] ? 1 : -1;
        } else {
          return a[sortField] < b[sortField] ? 1 : -1;
        }
      });
      
      return NextResponse.json(finalPayments);
    }
    
    // Create cache key based on parameters
    const cacheKey = `payments:${page}:${limit}:${status || 'all'}:${userId || 'all'}:${stationId || 'all'}:${sortBy}:${sortOrder}`;
    
    // Try to get data from Redis cache first
    if (redis.isAvailable()) {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log('Returning cached payments data');
        return NextResponse.json(JSON.parse(cachedData));
      }
    }
    
    const { db } = await connectToDatabase();
    
    // Build filter query
    const filter: any = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    if (stationId) filter.stationId = stationId;
    
    // Validate sortBy field to prevent injection
    const validSortFields = ['createdAt', 'amount', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Use projection to only fetch required fields
    const projection = {
      userId: 1,
      paymentId: 1,
      orderId: 1,
      amount: 1,
      status: 1,
      method: 1,
      stationId: 1,
      slotId: 1,
      duration: 1,
      currency: 1,
      createdAt: 1,
      updatedAt: 1
    };
    
    // Fetch payments with pagination, sorting, and projection for better performance
    const payments = await db.collection("payments")
      .find(filter)
      .project(projection)
      .skip(skip)
      .limit(limit)
      .sort({ [sortField]: sortOrder })
      .toArray();
    
    // Get total count for pagination using estimatedDocumentCount for better performance when no filters
    const totalCountFilter = Object.keys(filter).length === 0 
      ? await db.collection("payments").estimatedDocumentCount()
      : await db.collection("payments").countDocuments(filter);
    
    // Convert ObjectId to string for JSON serialization and ensure proper date formatting
    const serializedPayments = payments.map((payment: any) => ({
      ...payment,
      _id: payment._id.toString(),
      userId: payment.userId.toString(),
      stationId: payment.stationId.toString(),
      createdAt: payment.createdAt?.toISOString ? payment.createdAt.toISOString() : payment.createdAt,
      updatedAt: payment.updatedAt?.toISOString ? payment.updatedAt.toISOString() : payment.updatedAt
    }));
    
    const response = {
      success: true,
      data: serializedPayments,
      pagination: {
        page,
        limit,
        total: totalCountFilter,
        pages: Math.ceil(totalCountFilter / limit)
      }
    };
    
    // Cache the response for 60 seconds
    if (redis.isAvailable()) {
      await redis.setex(cacheKey, 60, JSON.stringify(response));
    }
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate payment data
    if (!validatePayment(body)) {
      return NextResponse.json(
        { error: "Invalid payment data" },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Insert new payment
    const { _id, ...paymentData } = body;
    
    const result: any = await db.collection("payments").insertOne({
      ...paymentData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Publish update to Redis for real-time sync
    if (redis.isAvailable()) {
      const paymentData = {
        event: 'payment_update',
        operationType: 'insert',
        documentKey: result.insertedId.toString(),
        fullDocument: {
          ...body,
          _id: result.insertedId.toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        timestamp: new Date().toISOString()
      };
      
      await redis.enqueueMessage('client_activity_channel', JSON.stringify(paymentData));
    }
    
    return NextResponse.json({ 
      success: true, 
      id: result.insertedId.toString() 
    });
  } catch (error: any) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid payment ID" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Validate payment data
    if (!validatePayment(body)) {
      return NextResponse.json(
        { error: "Invalid payment data" },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Update payment using findOneAndUpdate with projection for efficiency
    const result: any = await db.collection("payments").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...body,
          updatedAt: new Date()
        }
      },
      { 
        returnDocument: 'after',
        projection: { 
          userId: 1,
          paymentId: 1,
          orderId: 1,
          amount: 1,
          status: 1,
          method: 1,
          stationId: 1,
          slotId: 1,
          duration: 1,
          currency: 1,
          createdAt: 1,
          updatedAt: 1
        } 
      }
    );
    
    if (!result || !result['ok']) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }
    
    // Publish update to Redis for real-time sync
    if (redis.isAvailable()) {
      const paymentData = {
        event: 'payment_update',
        operationType: 'update',
        documentKey: id,
        fullDocument: {
          ...result['value'],
          _id: id,
          updatedAt: new Date()
        },
        timestamp: new Date().toISOString()
      };
      
      await redis.enqueueMessage('client_activity_channel', JSON.stringify(paymentData));
    }
    
    return NextResponse.json({ 
      success: true, 
      data: {
        ...result['value'],
        _id: id
      }
    });
  } catch (error: any) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid payment ID" },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Delete payment
    const result = await db.collection("payments").deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }
    
    // Publish update to Redis for real-time sync
    if (redis.isAvailable()) {
      const paymentData = {
        event: 'payment_update',
        operationType: 'delete',
        documentKey: id,
        timestamp: new Date().toISOString()
      };
      
      await redis.enqueueMessage('client_activity_channel', JSON.stringify(paymentData));
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Payment deleted successfully"
    });
  } catch (error: any) {
    console.error("Error deleting payment:", error);
    return NextResponse.json(
      { error: "Failed to delete payment" },
      { status: 500 }
    );
  }
}