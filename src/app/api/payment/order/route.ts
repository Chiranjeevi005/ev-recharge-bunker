import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    
    // Parse the request body safely
    let body;
    try {
      body = await request.json();
      console.log("Payment order request body:", body);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" }, 
        { status: 400 }
      );
    }
    
    const { stationId, slotId, duration, amount, userId } = body;
    
    // Validate input
    if (!stationId || !slotId || !duration || amount === undefined) {
      console.error("Missing required fields:", { stationId, slotId, duration, amount });
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      );
    }
    
    console.log("Creating payment order with:", { stationId, slotId, duration, amount, userId });
    
    // Validate amount
    if (amount <= 0) {
      console.error("Invalid amount:", amount);
      return NextResponse.json(
        { error: "Invalid amount" }, 
        { status: 400 }
      );
    }
    
    // Validate duration
    if (duration <= 0 || duration > 24) {
      console.error("Invalid duration:", duration);
      return NextResponse.json(
        { error: "Invalid duration. Must be between 1 and 24 hours." }, 
        { status: 400 }
      );
    }
    
    // Create Razorpay order
    try {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      
      if (!keyId || !keySecret) {
        console.error('Razorpay credentials not found in environment variables');
        throw new Error('Payment gateway not configured');
      }
      
      // In a production environment, you would make an API call to Razorpay here
      // For now, we'll keep the mock implementation but with proper error handling
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log("Created mock order with ID:", orderId);
      
    
    // Store order in database with proper structure
    console.log("Creating payment record with orderId:", orderId);
    const paymentRecord = {
      userId: userId || "anonymous",
      stationId,
      slotId,
      amount,
      duration,
      currency: 'INR',
      orderId: orderId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const orderResult = await db.collection("payments").insertOne(paymentRecord);
    
    console.log("Payment record created:", {
      insertedId: orderResult.insertedId.toString(),
      orderId: orderId,
      userId,
      stationId,
      slotId,
      amount,
      duration
    });
    
    return NextResponse.json({
      orderId: orderId,
      amount: amount * 100, // Return amount in paise to match Razorpay format
      currency: 'INR',
      bookingId: orderResult.insertedId.toString()
    });
  } catch (error: any) {
    console.error("Error creating payment order:", error);
    return NextResponse.json(
      { error: "Failed to create payment order", details: error.message }, 
      { status: 500 }
    );
  }
}