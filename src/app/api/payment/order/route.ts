import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';
import Razorpay from 'razorpay';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env['RAZORPAY_KEY_ID']!,
  key_secret: process.env['RAZORPAY_KEY_SECRET']!
});

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
    if (!stationId || !slotId || !duration || amount === undefined || amount === null) {
      console.error("Missing required fields:", { stationId, slotId, duration, amount });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Creating payment order with:", { stationId, slotId, duration, amount, userId });

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      console.error("Invalid amount:", amount);
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Validate duration
    if (typeof duration !== 'number' || duration <= 0 || duration > 24) {
      console.error("Invalid duration:", duration);
      return NextResponse.json(
        { error: "Invalid duration. Must be between 1 and 24 hours." },
        { status: 400 }
      );
    }
    
    // Validate stationId and slotId
    if (typeof stationId !== 'string' || typeof slotId !== 'string') {
      console.error("Invalid stationId or slotId:", { stationId, slotId });
      return NextResponse.json(
        { error: "Invalid stationId or slotId" },
        { status: 400 }
      );
    }

    // Create Razorpay order using the actual SDK
    // Fix: Shorten the receipt ID to be within 40 characters
    const receiptId = `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`.substring(0, 40);
    console.log("Creating Razorpay order with receiptId:", receiptId);

    let order;
    try {
      order = await razorpay.orders.create({
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        receipt: receiptId
      });
      console.log("Razorpay order created:", order);
    } catch (razorpayError: any) {
      console.error("Error creating Razorpay order:", razorpayError);
      // Log more detailed error information
      if (razorpayError.statusCode) {
        console.error("Razorpay status code:", razorpayError.statusCode);
      }
      if (razorpayError.error) {
        console.error("Razorpay error details:", razorpayError.error);
      }
      return NextResponse.json(
        { 
          error: "Failed to create payment order with Razorpay", 
          details: razorpayError.message,
          code: razorpayError.statusCode
        },
        { status: 500 }
      );
    }

    // Validate Razorpay order
    if (!order || !order.id) {
      console.error("Invalid Razorpay order response:", order);
      return NextResponse.json(
        { error: "Invalid Razorpay order response" },
        { status: 500 }
      );
    }

    // Store order in database with proper structure
    console.log("Creating payment record with orderId:", order.id);
    const paymentRecord = {
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
    };

    let orderResult;
    try {
      orderResult = await db.collection("payments").insertOne(paymentRecord);
    } catch (dbError) {
      console.error("Database error while storing payment record:", dbError);
      return NextResponse.json(
        { error: "Failed to store payment record in database" },
        { status: 500 }
      );
    }

    console.log("Payment record created:", {
      insertedId: orderResult.insertedId.toString(),
      orderId: order.id,
      userId,
      stationId,
      slotId,
      amount,
      duration
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount, // This is already in paise from Razorpay
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
      { error: "Failed to create payment order", details: error.message },
      { status: 500 }
    );
  }
}