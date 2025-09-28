import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';

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

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Fetch all bookings
    const bookings = await db.collection<Booking>("bookings").find({}).toArray();
    
    // Convert ObjectId to string for JSON serialization
    const serializedBookings = bookings.map(booking => ({
      ...booking,
      _id: booking._id?.toString(),
      userId: booking.userId,
      stationId: booking.stationId,
      slotId: booking.slotId
    }));
    
    return NextResponse.json(serializedBookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    
    // Insert new booking
    const result = await db.collection<Booking>("bookings").insertOne({
      ...body,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return NextResponse.json({ 
      success: true, 
      id: result.insertedId.toString() 
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    
    const { bookingId, ...updateData } = body;
    
    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" }, 
        { status: 400 }
      );
    }
    
    // Update booking
    const result = await db.collection<Booking>("bookings").updateOne(
      { _id: new ObjectId(bookingId) },
      { 
        $set: { 
          ...updateData,
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Booking not found" }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" }, 
      { status: 500 }
    );
  }
}