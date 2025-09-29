import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';

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
    
    // Fetch active booking for the user (status: 'confirmed' or 'active')
    const activeBooking = await db.collection("bookings").findOne({ 
      userId: userId,
      status: { $in: ['confirmed', 'active'] }
    });
    
    if (!activeBooking) {
      return NextResponse.json(null);
    }
    
    // Convert ObjectId to string for JSON serialization
    const serializedBooking = {
      ...activeBooking,
      _id: activeBooking._id.toString()
    };
    
    return NextResponse.json(serializedBooking);
  } catch (error) {
    console.error("Error fetching active booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch active booking" }, 
      { status: 500 }
    );
  }
}