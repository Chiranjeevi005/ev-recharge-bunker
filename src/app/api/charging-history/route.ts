import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId, Db } from 'mongodb';

interface Booking {
  _id: ObjectId;
  userId: string;
  stationId: string;
  slotId: string;
  startTime: string;
  endTime: string;
  amount: number;
  paymentId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const typedDb = db as Db;
    
    // Get userId from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" }, 
        { status: 400 }
      );
    }
    
    // Fetch completed bookings for the user
    const bookings = await typedDb.collection<Booking>("bookings").find({ 
      userId: userId,
      status: 'completed'
    }).sort({ createdAt: -1 }).toArray();
    
    // Convert ObjectId to string for JSON serialization
    const serializedBookings = bookings.map(booking => ({
      ...booking,
      _id: booking._id.toString()
    }));
    
    return NextResponse.json(serializedBookings);
  } catch (error) {
    console.error("Error fetching charging history:", error);
    return NextResponse.json(
      { error: "Failed to fetch charging history" }, 
      { status: 500 }
    );
  }
}