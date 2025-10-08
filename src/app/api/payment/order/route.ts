import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';
import Razorpay from 'razorpay';

// Add a validation function for the API
const validatePaymentRequest = (body: any) => {
  const errors: string[] = [];
  const validatedData: any = {};
  
  // Validate userId
  if (body.userId === undefined || body.userId === null) {
    validatedData.userId = 'anonymous';
  } else {
    validatedData.userId = String(body.userId).trim() || 'anonymous';
  }
  
  // Validate stationId
  if (!body.stationId || String(body.stationId).trim() === '') {
    errors.push('Station ID is required');
  } else {
    validatedData.stationId = String(body.stationId).trim();
  }
  
  // Validate slotId
  if (!body.slotId || String(body.slotId).trim() === '') {
    errors.push('Slot ID is required');
  } else {
    validatedData.slotId = String(body.slotId).trim();
  }
  
  // Validate duration
  const duration = Number(body.duration);
  if (isNaN(duration) || duration <= 0 || duration > 24) {
    validatedData.duration = 1; // Default to 1 hour
  } else {
    validatedData.duration = Math.max(1, Math.min(24, duration));
  }
  
  // Validate amount
  const amount = Number(body.amount);
  if (isNaN(amount) || amount <= 0) {
    validatedData.amount = 1; // Default to ₹1
  } else {
    validatedData.amount = Math.max(1, amount);
  }
  
  // Additional validation for realistic values
  if (validatedData.amount > 100000) { // Max ₹1000
    errors.push('Amount exceeds maximum allowed value');
  }
  
  if (validatedData.duration > 24) { // Max 24 hours
    errors.push('Duration exceeds maximum allowed value');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    data: validatedData
  };
};

export async function POST(request: Request) {
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
    
    // Trim whitespace from environment variables to handle potential newline characters
    const razorpayKeyId = process.env['RAZORPAY_KEY_ID'].trim();
    const razorpayKeySecret = process.env['RAZORPAY_KEY_SECRET'].trim();
    
    // Add additional validation to ensure keys are not empty
    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error("Razorpay environment variables are empty");
      return NextResponse.json(
        { 
          error: "Payment service not properly configured",
          details: "Razorpay API keys are empty. Please check environment variables."
        },
        { status: 500 }
      );
    }
    
    razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret
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

    // Validate the request data
    const validation = validatePaymentRequest(body);
    
    if (!validation.isValid) {
      console.error("Validation errors:", validation.errors);
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors.join(', ') },
        { status: 400 }
      );
    }
    
    const { stationId, slotId, duration, amount, userId } = validation.data;

    // DEBUG: Log validated values
    console.log("VALIDATED VALUES:", { 
      stationId, 
      slotId, 
      duration,
      amount,
      userId,
      durationType: typeof duration,
      amountType: typeof amount
    });

    console.log("Creating payment order with validated values:", { 
      stationId, 
      slotId, 
      duration, 
      amount, 
      userId 
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
      const razorpayAmount = Math.max(100, Math.round(amount * 100));
      
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
      userId: userId,
      stationId: stationId,
      slotId: slotId,
      amount: amount,
      duration: duration,
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
      userId: userId,
      stationId: stationId,
      slotId: slotId,
      amount: amount,
      duration: duration
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