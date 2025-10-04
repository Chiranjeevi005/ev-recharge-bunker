import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase();
    
    // Fetch all charging sessions
    const sessions = await db.collection("sessions").find({}).toArray();
    
    // Convert ObjectId to string for JSON serialization and map fields
    const serializedSessions = sessions.map((session: any) => ({
      id: session._id.toString(),
      userId: session.userId || '',
      stationId: session.stationId || '',
      startTime: session.startTime || new Date().toISOString(),
      endTime: session.endTime || new Date().toISOString(),
      energyConsumed: session.energyConsumed || 0,
      status: session.status || 'unknown'
    }));

    return NextResponse.json(serializedSessions);
  } catch (error: any) {
    console.error("Error fetching sessions:", error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to fetch sessions";
    if (error.message && error.message.includes('Authentication failed')) {
      errorMessage = "Database authentication failed. Please check your MongoDB credentials.";
    } else if (error.message && error.message.includes('connect ECONNREFUSED')) {
      errorMessage = "Database connection refused. Please check if your MongoDB server is running.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    );
  }
}