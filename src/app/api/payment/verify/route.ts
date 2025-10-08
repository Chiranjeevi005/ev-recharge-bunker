import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';
import { PaymentService } from '@/lib/payment/payment';
import redis from '@/lib/realtime/redisQueue';

export async function POST(request: Request) {
  try {
    // Trim whitespace from environment variables to handle potential newline characters
    const razorpayKeySecret = process.env['RAZORPAY_KEY_SECRET']?.trim();
    
    // Add validation for Razorpay key secret
    if (!razorpayKeySecret) {
      console.error("Razorpay key secret not found or is empty");
      return NextResponse.json(
        { error: "Payment service not properly configured" }, 
        { status: 500 }
      );
    }
    
    const { db } = await connectToDatabase(); // Removed client since we're not using transactions
    
    // Parse request body with error handling
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
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
    
    // Validate input with detailed error messages
    if (!razorpay_order_id) {
      return NextResponse.json(
        { error: "Missing razorpay_order_id parameter" }, 
        { status: 400 }
      );
    }
    
    if (!razorpay_payment_id) {
      return NextResponse.json(
        { error: "Missing razorpay_payment_id parameter" }, 
        { status: 400 }
      );
    }
    
    if (!razorpay_signature) {
      return NextResponse.json(
        { error: "Missing razorpay_signature parameter" }, 
        { status: 400 }
      );
    }
    
    // Additional validation for data types and format
    if (typeof razorpay_order_id !== 'string') {
      return NextResponse.json(
        { error: "Invalid razorpay_order_id parameter type. Expected string." }, 
        { status: 400 }
      );
    }
    
    if (typeof razorpay_payment_id !== 'string') {
      return NextResponse.json(
        { error: "Invalid razorpay_payment_id parameter type. Expected string." }, 
        { status: 400 }
      );
    }
    
    if (typeof razorpay_signature !== 'string') {
      return NextResponse.json(
        { error: "Invalid razorpay_signature parameter type. Expected string." }, 
        { status: 400 }
      );
    }
    
    // Validate parameter lengths
    if (razorpay_order_id.length > 100) {
      return NextResponse.json(
        { error: "Invalid razorpay_order_id parameter. Too long." }, 
        { status: 400 }
      );
    }
    
    if (razorpay_payment_id.length > 100) {
      return NextResponse.json(
        { error: "Invalid razorpay_payment_id parameter. Too long." }, 
        { status: 400 }
      );
    }
    
    if (razorpay_signature.length > 200) {
      return NextResponse.json(
        { error: "Invalid razorpay_signature parameter. Too long." }, 
        { status: 400 }
      );
    }
    
    // Verify Razorpay signature
    const isVerified = await PaymentService.verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpayKeySecret
    );
    
    if (!isVerified) {
      console.error("Razorpay signature verification failed");
      return NextResponse.json(
        { error: "Payment verification failed" }, 
        { status: 400 }
      );
    }
    
    // Update payment status
    const updatedPayment = await PaymentService.updatePaymentStatus(
      razorpay_order_id,
      razorpay_payment_id,
      'completed'
    );
    
    if (!updatedPayment) {
      console.error(`Failed to update payment status for orderId: '${razorpay_order_id}'`);
      return NextResponse.json(
        { error: "Failed to update payment status" }, 
        { status: 500 }
      );
    }
    
    console.log("PaymentService.updatePaymentStatus result:", updatedPayment);
    
    // Get payment record for booking creation
    const paymentRecord = await db.collection('payments').findOne(
      { orderId: razorpay_order_id }
    );
    
    if (!paymentRecord) {
      console.error(`Payment record not found for orderId: '${razorpay_order_id}'`);
      return NextResponse.json(
        { error: "Payment record not found" }, 
        { status: 500 }
      );
    }
    
    // Create booking record with proper structure
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + (Number(paymentRecord['duration'] || 1)) * 60 * 60 * 1000);
    
    const bookingData = {
      userId: paymentRecord['userId'] || "anonymous",
      stationId: paymentRecord['stationId'],
      slotId: paymentRecord['slotId'],
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      amount: Number(paymentRecord['amount']),
      paymentId: razorpay_payment_id,
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log("Creating booking record:", bookingData);
    const bookingResult = await db.collection("bookings").insertOne(bookingData);
    console.log("Booking record created:", bookingResult.insertedId.toString());
    
    // Update slot status to occupied
    // Fix: Properly handle ObjectId conversion for stationId
    let stationFilter: any = null; // Use 'any' type to avoid TypeScript issues
    console.log("Payment record stationId:", paymentRecord['stationId']);
    console.log("stationId type:", typeof paymentRecord['stationId']);
    
    // Check if stationId is a valid ObjectId string
    if (typeof paymentRecord['stationId'] === 'string' && ObjectId.isValid(paymentRecord['stationId'])) {
      // stationId is a valid ObjectId string, convert it to ObjectId
      stationFilter = { 
        _id: new ObjectId(paymentRecord['stationId']), 
        "slots.slotId": paymentRecord['slotId'] 
      };
      console.log("Using ObjectId for station filter");
    } else if (typeof paymentRecord['stationId'] === 'string') {
      // stationId is a string but not a valid ObjectId, use it as-is
      stationFilter = { 
        _id: paymentRecord['stationId'], 
        "slots.slotId": paymentRecord['slotId'] 
      };
      console.log("Using string ID for station filter");
    } else {
      // stationId is neither a string nor valid ObjectId
      console.log("Invalid stationId format, skipping slot update");
    }
    
    if (stationFilter) {
      console.log("Station filter for update:", stationFilter);
      
      const updateResult = await db.collection("stations").updateOne(
        stationFilter,
        { 
          $set: { 
            "slots.$.status": "occupied"
          } 
        }
      );
      
      console.log("Slot status update result:", updateResult);
      
      // Check if the update was successful
      if (updateResult.matchedCount === 0) {
        console.warn("No station slot matched for update. StationId:", paymentRecord['stationId'], "SlotId:", paymentRecord['slotId']);
      }
    }
    
    // Emit real-time payment update
    try {
      await PaymentService.emitPaymentUpdate(updatedPayment);
    } catch (emitError) {
      console.error("Error emitting payment update:", emitError);
      // Don't fail the whole request if real-time update fails
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      bookingId: bookingResult.insertedId.toString(),
      paymentId: razorpay_payment_id
    });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment", details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}