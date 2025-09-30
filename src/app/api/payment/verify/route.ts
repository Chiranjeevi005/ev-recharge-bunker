import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';
import { PaymentService } from '@/lib/payment';

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
    
    console.log("Payment verification request received:", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
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
    
    // Verify the payment signature with Razorpay
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');
    
    if (digest !== razorpay_signature) {
      console.error("Invalid payment signature. Expected:", digest, "Received:", razorpay_signature);
      return NextResponse.json(
        { error: "Invalid payment signature" }, 
        { status: 400 }
      );
    }
    
    // Find the payment record
    console.log(`Searching for payment record with orderId: '${razorpay_order_id}'`);
    console.log("Type of razorpay_order_id:", typeof razorpay_order_id);
    
    // First, let's check what collections exist
    try {
      const collections = await db.listCollections().toArray();
      console.log("Available collections:", collections.map(c => c.name));
    } catch (collectionError) {
      console.error("Error listing collections:", collectionError);
    }
    
    // Let's also try to find all payment records to see what's in the database
    try {
      const allPayments = await db.collection("payments").find({}).toArray();
      console.log("All payment records in database:", allPayments.map(p => ({
        _id: p._id,
        orderId: p.orderId,
        userId: p.userId,
        status: p.status,
        createdAt: p.createdAt
      })));
    } catch (err) {
      console.error("Error fetching all payment records:", err);
    }
    
    const paymentRecord = await db.collection("payments").findOne({ 
      orderId: razorpay_order_id 
    });
    
    if (!paymentRecord) {
      console.error(`Payment record not found for orderId: '${razorpay_order_id}'`);
      // Let's also try with trimmed version
      const trimmedOrderId = razorpay_order_id.trim();
      console.log(`Trying with trimmed orderId: '${trimmedOrderId}'`);
      const paymentRecordTrimmed = await db.collection("payments").findOne({ 
        orderId: trimmedOrderId 
      });
      
      if (paymentRecordTrimmed) {
        console.log("Found payment record with trimmed orderId:", paymentRecordTrimmed);
      } else {
        console.error("Still no payment record found with trimmed orderId");
      }
      
      return NextResponse.json(
        { error: "Payment record not found" }, 
        { status: 404 }
      );
    }
    
    console.log("Found payment record:", {
      _id: paymentRecord._id,
      orderId: paymentRecord.orderId,
      userId: paymentRecord.userId,
      stationId: paymentRecord.stationId,
      slotId: paymentRecord.slotId,
      amount: paymentRecord.amount,
      duration: paymentRecord.duration,
      status: paymentRecord.status,
      createdAt: paymentRecord.createdAt
    });
    
    // Update payment status using the payment service
    console.log(`Updating payment status for orderId: '${razorpay_order_id}'`);
    const updatedPayment = await PaymentService.updatePaymentStatus(
      razorpay_order_id, 
      razorpay_payment_id, 
      'completed'
    );
    
    if (!updatedPayment) {
      console.error(`Failed to update payment status for orderId: '${razorpay_order_id}'`);
      // Let's also try to find the payment record again to see if it still exists
      try {
        const paymentRecordCheck = await db.collection("payments").findOne({ 
          orderId: razorpay_order_id 
        });
        console.log("Payment record check:", paymentRecordCheck);
      } catch (checkError) {
        console.error("Error checking payment record:", checkError);
      }
      
      return NextResponse.json(
        { error: "Failed to update payment status" }, 
        { status: 500 }
      );
    }
    
    console.log("Updated payment record:", updatedPayment);
    
    // Create booking record
    const bookingResult = await db.collection("bookings").insertOne({
      userId: paymentRecord.userId || "anonymous", // In a real app, you'd get this from session
      stationId: paymentRecord.stationId,
      slotId: paymentRecord.slotId,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + paymentRecord.duration * 60 * 60 * 1000).toISOString(),
      amount: paymentRecord.amount,
      paymentId: razorpay_payment_id,
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Update slot status to occupied
    // Fix: Check if stationId is a string or ObjectId and handle accordingly
    const stationFilter = ObjectId.isValid(paymentRecord.stationId) 
      ? { _id: new ObjectId(paymentRecord.stationId), "slots.slotId": paymentRecord.slotId }
      : { _id: paymentRecord.stationId, "slots.slotId": paymentRecord.slotId };
      
    await db.collection("stations").updateOne(
      stationFilter,
      { 
        $set: { 
          "slots.$.status": "occupied"
        } 
      }
    );
    
    // Emit real-time payment update
    await PaymentService.emitPaymentUpdate(updatedPayment);
    
    return NextResponse.json({
      success: true,
      bookingId: bookingResult.insertedId.toString(),
      paymentId: razorpay_payment_id
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" }, 
      { status: 500 }
    );
  }
}