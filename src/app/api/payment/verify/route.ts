import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';
import { PaymentService } from '@/lib/payment';

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    
    console.log("Payment verification request body:", JSON.stringify(body, null, 2));
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, is_test } = body;
    
    console.log("Payment verification request received:", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      is_test
    });
    
    console.log("Request body type:", typeof body);
    console.log("is_test type:", typeof is_test);
    console.log("is_test value:", is_test);
    
    // Validate input
    if (!razorpay_order_id) {
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
    console.log("Checking is_test condition:", is_test);
    console.log("is_test truthiness:", !!is_test);
    if (is_test) {
      console.log("Skipping signature verification for test payment");
      isValid = true;
    } else {
      console.log("Performing signature verification");
      // Verify Razorpay signature
      isValid = await PaymentService.verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      console.log("Signature verification result:", isValid);
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
    console.log("Type of razorpay_order_id:", typeof razorpay_order_id);
    
    const paymentRecord = await db.collection("payments").findOne({ 
      orderId: razorpay_order_id 
    });
    
    console.log("Payment record search result:", paymentRecord);
    
    if (!paymentRecord) {
      console.error(`Payment record not found for orderId: '${razorpay_order_id}'`);
      return NextResponse.json(
        { error: "Payment record not found" }, 
        { status: 404 }
      );
    }
    
    console.log("Found payment record:", {
      _id: paymentRecord['_id'],
      orderId: paymentRecord['orderId'],
      userId: paymentRecord['userId'],
      stationId: paymentRecord['stationId'],
      slotId: paymentRecord['slotId'],
      amount: paymentRecord['amount'],
      duration: paymentRecord['duration'],
      status: paymentRecord['status'],
      createdAt: paymentRecord['createdAt']
    });
    
    // Update payment status using the payment service
    console.log(`Updating payment status for orderId: '${razorpay_order_id}'`);
    const updatedPayment = await PaymentService.updatePaymentStatus(
      razorpay_order_id, 
      razorpay_payment_id || `pay_${Date.now()}`, 
      'completed'
    );
    
    console.log("PaymentService.updatePaymentStatus result:", updatedPayment);
    
    if (!updatedPayment) {
      console.error(`Failed to update payment status for orderId: '${razorpay_order_id}'`);
      return NextResponse.json(
        { error: "Failed to update payment status" }, 
        { status: 500 }
      );
    }
    
    console.log("Updated payment record:", updatedPayment);
    
    // Create booking record with proper structure
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + paymentRecord['duration'] * 60 * 60 * 1000);
    
    const bookingData = {
      userId: paymentRecord['userId'] || "anonymous",
      stationId: paymentRecord['stationId'],
      slotId: paymentRecord['slotId'],
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      amount: paymentRecord['amount'],
      paymentId: razorpay_payment_id || `pay_${Date.now()}`,
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log("Creating booking record:", bookingData);
    const bookingResult = await db.collection("bookings").insertOne(bookingData);
    console.log("Booking record created:", bookingResult.insertedId.toString());
    
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
    await PaymentService.emitPaymentUpdate(updatedPayment);
    
    return NextResponse.json({
      success: true,
      bookingId: bookingResult.insertedId.toString(),
      paymentId: razorpay_payment_id || `pay_${Date.now()}`
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment", details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}