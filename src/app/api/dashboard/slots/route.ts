import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';

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

    // Fetch user's city/location to get nearby stations
    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    
    // For demo purposes, we'll use a default city
    const city = user?.city || "Delhi";
    
    // Fetch stations for the city
    const stations = await db.collection("stations").find({ 
      city: city 
    }).limit(5).toArray();

    // Get slot availability from Redis for each station (if available)
    const availabilityPromises = stations.map(async (station: any) => {
      // Try Redis first (if available)
      if (redis.isAvailable()) {
        const availabilityKey = `station:${city}:${station._id}:availability`;
        const availabilityData = await redis.get(availabilityKey);
        
        if (availabilityData) {
          const availability = JSON.parse(availabilityData);
          return {
            stationId: station._id.toString(),
            stationName: station.name,
            location: station.address,
            ...availability
          };
        }
      }
      
      // If not in Redis or Redis not available, calculate from station data
      const availableSlots = station.slots?.filter((slot: any) => slot.status === "available").length || 0;
      return {
        stationId: station._id.toString(),
        stationName: station.name,
        location: station.address,
        slotsAvailable: availableSlots,
        waitingTime: `${Math.max(5, availableSlots * 2)} mins`
      };
    });

    const availability = await Promise.all(availabilityPromises);

    return NextResponse.json(availability);
  } catch (error) {
    console.error("Error fetching slot availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch slot availability" }, 
      { status: 500 }
    );
  }
}