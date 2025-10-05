import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';

interface Payment {
  _id: ObjectId;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  userId: string;
  stationId: string;
  stationName?: string;
  slotId: string;
  duration: number;
  method: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Station {
  _id: ObjectId | string;
  name: string;
  // ... other station properties
}

export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase();
    
    // Get userId from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" }, 
        { status: 400 }
      );
    }
    
    // Fetch payments for the user
    const payments = await db.collection<Payment>("payments").find({ 
      userId: userId 
    }).sort({ createdAt: -1 }).toArray();
    
    // Enhance payments with station names if not already present
    const enhancedPayments = await Promise.all(payments.map(async (payment) => {
      // If stationName is not already set, try to fetch it
      let stationName = payment.stationName || 'Unknown Station';
      
      if (stationName === 'Unknown Station' && payment.stationId) {
        try {
          // Try to find station by ObjectId
          let station;
          if (ObjectId.isValid(payment.stationId)) {
            station = await db.collection<Station>('stations').findOne({ _id: new ObjectId(payment.stationId) });
          } else {
            // Try to find by string ID
            station = await db.collection<Station>('stations').findOne({ _id: payment.stationId } as any);
          }
          
          if (station && station['name']) {
            stationName = station['name'];
          }
        } catch (error) {
          console.error("Error fetching station name:", error);
        }
      }
      
      return {
        ...payment,
        stationName,
        _id: payment._id.toString()
      };
    }));
    
    return NextResponse.json(enhancedPayments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" }, 
      { status: 500 }
    );
  }
}