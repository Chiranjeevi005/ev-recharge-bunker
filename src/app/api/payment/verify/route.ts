import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';
import { PaymentService } from '@/lib/payment';

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    let body;
    
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error("Error parsing request body:", jsonError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" }, 
        { status: 400 }
      );
    }
    
    console.log("Payment verification request body:", JSON.stringify(body, null, 2));
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, is_test } = body;
    
    console.log("Payment verification request received:", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      is_test
    });
    
    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error("Missing required fields for payment verification:", {
        razorpay_order_id: !!razorpay_order_id,
        razorpay_payment_id: !!razorpay_payment_id,
        razorpay_signature: !!razorpay_signature
      });
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      );
    }
    
    // Skip signature verification for tests
    let isValid = false;
    if (is_test) {
      console.log("Skipping signature verification for test payment");
      isValid = true;
    } else {
      console.log("Performing signature verification");
      try {
        // Verify Razorpay signature
        isValid = await PaymentService.verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
        console.log("Signature verification result:", isValid);
      } catch (verificationError) {
        console.error("Error during signature verification:", verificationError);
        return NextResponse.json(
          { error: "Payment verification failed", details: verificationError instanceof Error ? verificationError.message : 'Unknown error' }, 
          { status: 500 }
        );
      }
    }
    
    if (!isValid) {
      console.error("Invalid Razorpay signature", { razorpay_order_id, razorpay_payment_id });
      return NextResponse.json(
        { error: "Invalid payment signature" }, 
        { status: 400 }
      );
    }
    
    // Find the payment record
    console.log(`Searching for payment record with orderId: '${razorpay_order_id}'`);
    
    let paymentRecord;
    try {
      paymentRecord = await db.collection("payments").findOne({ 
        orderId: razorpay_order_id 
      });
    } catch (dbError) {
      console.error("Database error while finding payment record:", dbError);
      return NextResponse.json(
        { error: "Database error while retrieving payment record" }, 
        { status: 500 }
      );
    }
    
    console.log("Payment record search result:", paymentRecord);
    
    if (!paymentRecord) {
      console.error(`Payment record not found for orderId: '${razorpay_order_id}'`);
      return NextResponse.json(
        { error: "Payment record not found" }, 
        { status: 404 }
      );
    }
    
    // Update payment status using the payment service
    console.log(`Updating payment status for orderId: '${razorpay_order_id}'`);
    let updatedPayment;
    try {
      updatedPayment = await PaymentService.updatePaymentStatus(
        razorpay_order_id, 
        razorpay_payment_id, 
        'completed'
      );
    } catch (updateError) {
      console.error("Error updating payment status:", updateError);
      return NextResponse.json(
        { error: "Failed to update payment status", details: updateError instanceof Error ? updateError.message : 'Unknown error' }, 
        { status: 500 }
      );
    }
    
    console.log("PaymentService.updatePaymentStatus result:", updatedPayment);
    
    if (!updatedPayment) {
      console.error(`Failed to update payment status for orderId: '${razorpay_order_id}'`);
      return NextResponse.json(
        { error: "Failed to update payment status" }, 
        { status: 500 }
      );
    }
    
    // Create booking record with proper structure
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + (paymentRecord['duration'] || 1) * 60 * 60 * 1000);
    
    const bookingData = {
      userId: paymentRecord['userId'] || "anonymous",
      stationId: paymentRecord['stationId'],
      slotId: paymentRecord['slotId'],
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      amount: paymentRecord['amount'],
      paymentId: razorpay_payment_id,
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log("Creating booking record:", bookingData);
    let bookingResult;
    try {
      bookingResult = await db.collection("bookings").insertOne(bookingData);
      console.log("Booking record created:", bookingResult.insertedId.toString());
    } catch (bookingError) {
      console.error("Error creating booking record:", bookingError);
      // Even if booking creation fails, we should still return success since payment was verified
      return NextResponse.json(
        { 
          success: true,
          paymentId: razorpay_payment_id,
          warning: "Payment verified but booking creation failed"
        }
      );
    }
    
    // Update slot status to occupied
    try {
      const stationFilter = ObjectId.isValid(paymentRecord['stationId']) 
        ? { _id: new ObjectId(paymentRecord['stationId']), "slots.slotId": paymentRecord['slotId'] }
        : { _id: paymentRecord['stationId'], "slots.slotId": paymentRecord['slotId'] };
      
      const updateResult = await db.collection("stations").updateOne(
        stationFilter,
        { 
          $set: { 
            "slots.$.status": "occupied"
          } 
        }
      );
      
      console.log("Slot status update result:", updateResult);
    } catch (slotUpdateError) {
      console.error("Error updating slot status:", slotUpdateError);
    }
    
    // Emit real-time payment update
    try {
      await PaymentService.emitPaymentUpdate(updatedPayment);
    } catch (emitError) {
      console.error("Error emitting payment update:", emitError);
      // Don't fail the whole request if real-time update fails
    }
    
    return NextResponse.json({
      success: true,
      bookingId: bookingResult?.insertedId.toString() || null,
      paymentId: razorpay_payment_id
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment", details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}