import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, stationId, slotId, duration } = body;

    if (!userId || !stationId || !slotId || !duration) {
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      );
    }

    // Create a new charging session
    const session = {
      userId,
      stationId,
      slotId,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + duration * 60 * 60 * 1000).toISOString(),
      totalEnergyKWh: 0,
      totalCost: 0,
      paymentStatus: "pending",
      location: "",
      progress: 0,
      timeRemaining: duration * 60 * 60, // in seconds
      energyConsumed: 0,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to MongoDB
    const { db } = await connectToDatabase();
    const result = await db.collection("charging_sessions").insertOne(session);

    // Cache in Redis with 2-hour TTL (if available)
    if (redis.isAvailable()) {
      const sessionKey = `charging:session:${userId}`;
      await redis.setex(sessionKey, 7200, JSON.stringify({
        ...session,
        id: result.insertedId.toString()
      }));
    }

    // Update slot availability in Redis (if available)
    if (redis.isAvailable()) {
      const station = await db.collection("stations").findOne({ _id: new ObjectId(stationId) });
      if (station) {
        const availabilityKey = `station:${station.city}:${stationId}:availability`;
        const currentAvailability = await redis.get(availabilityKey);
        
        if (currentAvailability) {
          const availability = JSON.parse(currentAvailability);
          availability.slotsAvailable = Math.max(0, availability.slotsAvailable - 1);
          await redis.setex(availabilityKey, 3600, JSON.stringify(availability));
        }
      }
    }

    // Publish update via Redis Pub/Sub (if available)
    if (redis.isAvailable()) {
      await redis.publish("charging-session-update", JSON.stringify({
        userId,
        session: {
          ...session,
          id: result.insertedId.toString()
        }
      }));
    }

    return NextResponse.json({
      success: true,
      sessionId: result.insertedId.toString()
    });
  } catch (error) {
    console.error("Error booking slot:", error);
    return NextResponse.json(
      { error: "Failed to book slot" }, 
      { status: 500 }
    );
  }
}