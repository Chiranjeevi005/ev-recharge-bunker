import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    // Initialize Razorpay instance inside the function for better compatibility with serverless environments
    let razorpay: Razorpay | null = null;
    
    try {
      if (!process.env['RAZORPAY_KEY_ID'] || !process.env['RAZORPAY_KEY_SECRET']) {
        console.error("Razorpay environment variables not set");
        return NextResponse.json(
          { 
            error: "Payment service not properly configured",
            details: "Missing Razorpay API keys. Please check environment variables."
          },
          { status: 500 }
        );
      }
      
      razorpay = new Razorpay({
        key_id: process.env['RAZORPAY_KEY_ID']!,
        key_secret: process.env['RAZORPAY_KEY_SECRET']!
      });
    } catch (razorpayInitError: any) {
      console.error("Error initializing Razorpay:", razorpayInitError);
      return NextResponse.json(
        { 
          error: "Failed to initialize payment service", 
          details: razorpayInitError.message || "Unknown error during Razorpay initialization"
        },
        { status: 500 }
      );
    }

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

    // SAFEGUARD: Ensure no null/undefined values reach validation
    const safeBody = {
      stationId: String(body.stationId || '').trim(),
      slotId: String(body.slotId || '').trim(),
      duration: Math.max(1, Math.min(24, Number(body.duration) || 1)),
      amount: Math.max(1, Number(body.amount) || 1),
      userId: String(body.userId || 'anonymous').trim()
    };

    const { stationId, slotId, duration, amount, userId } = safeBody;

    // DEBUG: Log raw values before processing
    console.log("RAW VALUES BEFORE PROCESSING:", { 
      stationId, 
      slotId, 
      duration: duration,
      amount: amount,
      userId,
      durationType: typeof duration,
      amountType: typeof amount
    });

    // Validate input with more detailed logging
    console.log("Validating input fields:", { stationId, slotId, duration, amount, userId });
    
    // Ensure all values are properly converted to their expected types with defaults
    const parsedStationId = String(stationId || '').trim();
    const parsedSlotId = String(slotId || '').trim();
    const parsedDuration = Math.max(1, Math.min(24, Number(duration) || 1)); // Default to 1, clamp between 1-24
    const parsedAmount = Math.max(1, Number(amount) || 1);
    const parsedUserId = String(userId || 'anonymous').trim();
    
    // DEBUG: Log parsed values
    console.log("PARSED VALUES:", { 
      parsedStationId, 
      parsedSlotId, 
      parsedDuration, 
      parsedAmount, 
      parsedUserId,
      parsedDurationType: typeof parsedDuration,
      parsedAmountType: typeof parsedAmount
    });
    
    // Validate required fields
    if (!parsedStationId) {
      console.error("Missing required field: stationId");
      return NextResponse.json(
        { error: "Missing required field: stationId" },
        { status: 400 }
      );
    }
    
    if (!parsedSlotId) {
      console.error("Missing required field: slotId");
      return NextResponse.json(
        { error: "Missing required field: slotId" },
        { status: 400 }
      );
    }
    
    // Validate numeric fields
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      console.error("Invalid duration value:", parsedDuration, "Original:", duration);
      return NextResponse.json(
        { error: "Invalid duration. Must be a positive number between 1 and 24 hours." },
        { status: 400 }
      );
    }
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      console.error("Invalid amount value:", parsedAmount, "Original:", amount);
      return NextResponse.json(
        { error: "Invalid amount. Must be a positive number." },
        { status: 400 }
      );
    }

    console.log("Creating payment order with validated values:", { 
      stationId: parsedStationId, 
      slotId: parsedSlotId, 
      duration: parsedDuration, 
      amount: parsedAmount, 
      userId: parsedUserId 
    });

    // Create Razorpay order using the actual SDK
    // Fix: Shorten the receipt ID to be within 40 characters
    const receiptId = `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`.substring(0, 40);
    console.log("Creating Razorpay order with receiptId:", receiptId);

    let order;
    try {
      if (!razorpay) {
        throw new Error("Razorpay instance not initialized");
      }
      
      // Ensure amount is at least 100 paise (₹1)
      const razorpayAmount = Math.max(100, Math.round(parsedAmount * 100));
      
      console.log("RAZORPAY ORDER REQUEST:", {
        amount: razorpayAmount,
        currency: 'INR',
        receipt: receiptId
      });
      
      order = await razorpay.orders.create({
        amount: razorpayAmount,
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
      
      // Return more specific error messages based on the error type
      let errorMessage = "Failed to create payment order with Razorpay";
      if (razorpayError.error && razorpayError.error.description) {
        errorMessage = razorpayError.error.description;
      } else if (razorpayError.message) {
        errorMessage = razorpayError.message;
      }
      
      return NextResponse.json(
        { 
          error: "Failed to create payment order with Razorpay", 
          details: errorMessage,
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
      userId: parsedUserId,
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
    } catch (dbError: any) {
      console.error("Database error while storing payment record:", dbError);
      return NextResponse.json(
        { error: "Failed to store payment record in database", details: dbError.message },
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