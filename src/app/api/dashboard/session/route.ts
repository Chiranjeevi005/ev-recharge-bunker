import { NextResponse } from 'next/server';
import redis from '@/lib/realtime/redisQueue';
import { connectToDatabase } from '@/lib/db/connection';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" }, 
        { status: 400 }
      );
    }

    // Try to fetch active session from Redis first (if available)
    if (redis.isAvailable()) {
      const sessionKey = `charging:session:${userId}`;
      const sessionData = await redis.get(sessionKey);

      if (sessionData) {
        // Parse and return Redis data
        const session = JSON.parse(sessionData);
        return NextResponse.json(session);
      }
    }

    // If not in Redis or Redis not available, fetch from MongoDB
    const { db } = await connectToDatabase();
    const activeSession = await db.collection("charging_sessions").findOne({ 
      userId: userId,
      status: { $in: ['active', 'charging'] }
    });

    if (!activeSession) {
      return NextResponse.json(null);
    }

    // Convert ObjectId to string for JSON serialization
    const serializedSession = {
      ...activeSession,
      id: activeSession._id.toString(),
      _id: undefined
    };

    return NextResponse.json(serializedSession);
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" }, 
      { status: 500 }
    );
  }
}