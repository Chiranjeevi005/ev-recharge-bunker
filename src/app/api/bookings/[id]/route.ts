import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId, Db } from 'mongodb';

interface Booking {
  _id?: ObjectId;
  userId: string;
  stationId: string;
  slotId: string;
  startTime: string;
  endTime: string;
  amount: number;
  paymentId?: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();
    const typedDb = db as Db;
    
    // Validate booking ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid booking ID" }, 
        { status: 400 }
      );
    }
    
    // Fetch specific booking
    const booking = await typedDb.collection<Booking>("bookings").findOne({ 
      _id: new ObjectId(id) 
    });
    
    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" }, 
        { status: 404 }
      );
    }
    
    // Convert ObjectId to string for JSON serialization
    const serializedBooking = {
      ...booking,
      _id: booking._id?.toString(),
      userId: booking.userId,
      stationId: booking.stationId,
      slotId: booking.slotId,
      createdAt: booking.createdAt?.toISOString(),
      updatedAt: booking.updatedAt?.toISOString()
    };
    
    return NextResponse.json(serializedBooking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" }, 
      { status: 500 }
    );
  }
}