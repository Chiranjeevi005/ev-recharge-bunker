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
  createdAt: Date;
  updatedAt: Date;
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
    
    // Convert ObjectId to string for JSON serialization
    const serializedPayments = payments.map(payment => ({
      ...payment,
      _id: payment._id.toString()
    }));
    
    return NextResponse.json(serializedPayments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" }, 
      { status: 500 }
    );
  }
}