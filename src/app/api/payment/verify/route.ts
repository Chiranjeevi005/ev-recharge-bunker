import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
    
    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
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
      return NextResponse.json(
        { error: "Invalid payment signature" }, 
        { status: 400 }
      );
    }
    
    // Find the payment record
    const paymentRecord = await db.collection("payments").findOne({ 
      orderId: razorpay_order_id 
    });
    
    if (!paymentRecord) {
      return NextResponse.json(
        { error: "Payment record not found" }, 
        { status: 404 }
      );
    }
    
    // Update payment status
    await db.collection("payments").updateOne(
      { orderId: razorpay_order_id },
      { 
        $set: { 
          paymentId: razorpay_payment_id,
          status: 'completed',
          updatedAt: new Date()
        } 
      }
    );
    
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
    await db.collection("stations").updateOne(
      { 
        _id: new ObjectId(paymentRecord.stationId),
        "slots.slotId": paymentRecord.slotId
      },
      { 
        $set: { 
          "slots.$.status": "occupied"
        } 
      }
    );
    
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