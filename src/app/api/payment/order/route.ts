import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';
import Razorpay from 'razorpay';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
});

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    
    // Parse the request body safely
    let body;
    try {
      body = await request.json();
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
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      );
    }
    
    // Create Razorpay order using the actual SDK
    // Fix: Shorten the receipt ID to be within 40 characters
    const receiptId = `receipt_${Date.now()}`.substring(0, 40);
    
    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: receiptId
    });
    
    // Store order in database
    const orderResult = await db.collection("payments").insertOne({
      userId: userId || "anonymous",
      stationId,
      slotId,
      amount,
      duration,
      currency: 'INR',
      orderId: order.id,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount, // Return amount in paise
      currency: order.currency,
      bookingId: orderResult.insertedId.toString()
    });
  } catch (error: any) {
    console.error("Error creating payment order:", error);
    // Log the specific error for debugging
    if (error.statusCode) {
      console.error("Razorpay Error:", error);
    }
    return NextResponse.json(
      { error: "Failed to create payment order" }, 
      { status: 500 }
    );
  }
}