import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';
import { PaymentService } from '@/lib/payment/payment';
import redis from '@/lib/realtime/redisQueue';

export async function POST(request: Request) {
  try {
    const { db, client } = await connectToDatabase();
    const body = await request.json();
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
    
    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required parameters" }, 
        { status: 400 }
      );
    }
    
    // Verify Razorpay signature
    const isVerified = PaymentService.verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    
    if (!isVerified) {
      console.error("Razorpay signature verification failed");
      return NextResponse.json(
        { error: "Payment verification failed" }, 
        { status: 400 }
      );
    }
    
    // Start a session for transactions
    const session = client.startSession();
    
    try {
      let bookingId = null;
      let paymentId = null;
      
      // Start transaction
      await session.withTransaction(async () => {
        // Update payment status
        const updatedPayment = await PaymentService.updatePaymentStatus(
          razorpay_order_id,
          razorpay_payment_id,
          'completed'
        );
        
        if (!updatedPayment) {
          throw new Error(`Failed to update payment status for orderId: '${razorpay_order_id}'`);
        }
        
        console.log("PaymentService.updatePaymentStatus result:", updatedPayment);
        
        // Get payment record for booking creation
        const paymentRecord = await db.collection('payments').findOne(
          { orderId: razorpay_order_id },
          { session }
        );
        
        if (!paymentRecord) {
          throw new Error(`Payment record not found for orderId: '${razorpay_order_id}'`);
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
        const bookingResult = await db.collection("bookings").insertOne(bookingData, { session });
        console.log("Booking record created:", bookingResult.insertedId.toString());
        
        // Update slot status to occupied
        const stationFilter = ObjectId.isValid(paymentRecord['stationId']) 
          ? { _id: new ObjectId(paymentRecord['stationId']), "slots.slotId": paymentRecord['slotId'] }
          : { _id: paymentRecord['stationId'], "slots.slotId": paymentRecord['slotId'] };
        
        const updateResult = await db.collection("stations").updateOne(
          stationFilter,
          { 
            $set: { 
              "slots.$.status": "occupied"
            } 
          },
          { session }
        );
        
        console.log("Slot status update result:", updateResult);
        
        // Store the IDs for the response
        bookingId = bookingResult.insertedId.toString();
        paymentId = razorpay_payment_id;
        
        // Emit real-time payment update
        try {
          await PaymentService.emitPaymentUpdate(updatedPayment);
        } catch (emitError) {
          console.error("Error emitting payment update:", emitError);
          // Don't fail the whole request if real-time update fails
        }
      });
      
      // Return success response
      return NextResponse.json({
        success: true,
        bookingId: bookingId,
        paymentId: paymentId
      });
    } catch (transactionError) {
      console.error("Transaction failed:", transactionError);
      return NextResponse.json(
        { error: "Transaction failed", details: transactionError instanceof Error ? transactionError.message : 'Unknown error' }, 
        { status: 500 }
      );
    } finally {
      // End session
      await session.endSession();
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment", details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}