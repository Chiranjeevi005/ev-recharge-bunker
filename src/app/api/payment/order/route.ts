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

    // Validate input with more detailed logging
    console.log("Validating input fields:", { stationId, slotId, duration, amount, userId });
    
    // Ensure all values are properly converted to their expected types
    const parsedStationId = String(stationId || '');
    const parsedSlotId = String(slotId || '');
    const parsedDuration = Number(duration);
    const parsedAmount = Number(amount);
    const parsedUserId = String(userId || '');
    
    if (!parsedStationId || parsedStationId === 'null' || parsedStationId === 'undefined') {
      console.error("Missing required field: stationId");
      return NextResponse.json(
        { error: "Missing required field: stationId" },
        { status: 400 }
      );
    }
    
    if (!parsedSlotId || parsedSlotId === 'null' || parsedSlotId === 'undefined') {
      console.error("Missing required field: slotId");
      return NextResponse.json(
        { error: "Missing required field: slotId" },
        { status: 400 }
      );
    }
    
    if (isNaN(parsedDuration) || parsedDuration === null || parsedDuration === undefined) {
      console.error("Missing or invalid required field: duration", duration);
      return NextResponse.json(
        { error: "Missing or invalid required field: duration" },
        { status: 400 }
      );
    }
    
    if (isNaN(parsedAmount) || parsedAmount === null || parsedAmount === undefined) {
      console.error("Missing or invalid required field: amount", amount);
      return NextResponse.json(
        { error: "Missing or invalid required field: amount" },
        { status: 400 }
      );
    }

    console.log("Creating payment order with parsed values:", { 
      stationId: parsedStationId, 
      slotId: parsedSlotId, 
      duration: parsedDuration, 
      amount: parsedAmount, 
      userId: parsedUserId 
    });

    // Validate amount with detailed error messages
    if (isNaN(parsedAmount)) {
      console.error("Amount is NaN:", parsedAmount);
      return NextResponse.json(
        { error: "Amount is not a valid number (NaN)" },
        { status: 400 }
      );
    }
    
    if (parsedAmount <= 0) {
      console.error("Invalid amount value:", parsedAmount);
      return NextResponse.json(
        { error: "Invalid amount. Must be greater than 0" },
        { status: 400 }
      );
    }

    // Validate duration with detailed error messages
    if (isNaN(parsedDuration)) {
      console.error("Duration is NaN:", parsedDuration);
      return NextResponse.json(
        { error: "Duration is not a valid number (NaN)" },
        { status: 400 }
      );
    }
    
    if (parsedDuration <= 0) {
      console.error("Invalid duration value:", parsedDuration);
      return NextResponse.json(
        { error: "Invalid duration. Must be greater than 0" },
        { status: 400 }
      );
    }
    
    if (parsedDuration > 24) {
      console.error("Invalid duration value:", parsedDuration);
      return NextResponse.json(
        { error: "Invalid duration. Must be between 1 and 24 hours." },
        { status: 400 }
      );
    }
    
    // Validate stationId and slotId
    if (typeof stationId !== 'string') {
      console.error("Invalid stationId type:", typeof stationId, "Value:", stationId);
      return NextResponse.json(
        { error: `Invalid stationId type. Expected string, got ${typeof stationId}` },
        { status: 400 }
      );
    }
    
    if (typeof slotId !== 'string') {
      console.error("Invalid slotId type:", typeof slotId, "Value:", slotId);
      return NextResponse.json(
        { error: `Invalid slotId type. Expected string, got ${typeof slotId}` },
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
        amount: Math.round(parsedAmount * 100), // Amount in paise, rounded to avoid floating point issues
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
      userId: parsedUserId || "anonymous",
      stationId: parsedStationId,
      slotId: parsedSlotId,
      amount: parsedAmount,
      duration: parsedDuration,
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
      userId: parsedUserId,
      stationId: parsedStationId,
      slotId: parsedSlotId,
      amount: parsedAmount,
      duration: parsedDuration
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