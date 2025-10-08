import { NextResponse } from 'next/server';
import redis from '@/lib/realtime/redisQueue';
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

    // Validate userId format before using it
    let userObjectId: ObjectId | null = null;
    try {
      userObjectId = new ObjectId(userId);
    } catch (error) {
      console.log("Invalid userId format, using default city");
    }

    // Fetch user's city/location to get nearby stations
    const { db } = await connectToDatabase();
    
    let user = null;
    if (userObjectId) {
      user = await db.collection("users").findOne({ _id: userObjectId });
    }
    
    // For demo purposes, we'll use a default city
    const city = user?.['city'] || "Delhi";
    
    // Fetch stations for the city
    const stations = await db.collection("stations").find({ 
      city: city 
    }).limit(5).toArray();

    // If no stations found, return default slots
    if (!stations || stations.length === 0) {
      return NextResponse.json({
        stationName: "Green Energy Hub",
        slots: [
          { slotId: 'SL-7890', status: 'available', chargerType: 'Fast Charger', pricePerHour: 50 },
          { slotId: 'SL-7891', status: 'occupied', chargerType: 'Standard Charger', pricePerHour: 30 },
          { slotId: 'SL-7892', status: 'maintenance', chargerType: 'Fast Charger', pricePerHour: 50 },
          { slotId: 'SL-7893', status: 'available', chargerType: 'Ultra Fast Charger', pricePerHour: 80 }
        ]
      });
    }

    // Get slots from the first station
    const station = stations[0];
    let slots: any[] = [];

    // Try Redis first (if available)
    if (redis.isAvailable() && station && station._id) {
      const availabilityKey = `station:${city}:${station._id.toString()}:slots`;
      const slotsData = await redis.get(availabilityKey);
      
      if (slotsData) {
        slots = JSON.parse(slotsData);
      }
    }

    // If not in Redis or Redis not available, get from station data
    if (slots.length === 0 && station && station['slots']) {
      slots = station['slots'].map((slot: any, index: number) => ({
        slotId: slot['slotId'] || `SL-${station._id.toString().slice(-4)}${index.toString().padStart(2, '0')}`,
        status: slot['status'] || 'available',
        chargerType: slot['chargerType'] || 'Standard Charger',
        pricePerHour: slot['pricePerHour'] || 30
      }));
    }

    // If still no slots, create default ones
    if (slots.length === 0) {
      slots = [
        { slotId: 'SL-7890', status: 'available', chargerType: 'Fast Charger', pricePerHour: 50 },
        { slotId: 'SL-7891', status: 'occupied', chargerType: 'Standard Charger', pricePerHour: 30 },
        { slotId: 'SL-7892', status: 'maintenance', chargerType: 'Fast Charger', pricePerHour: 50 },
        { slotId: 'SL-7893', status: 'available', chargerType: 'Ultra Fast Charger', pricePerHour: 80 }
      ];
    }

    return NextResponse.json({
      stationName: (station && station['name']) || "Green Energy Hub",
      slots: slots
    });
  } catch (error) {
    console.error("Error fetching slot availability:", error);
    // Return default slots in case of error
    return NextResponse.json({
      stationName: "Green Energy Hub",
      slots: [
        { slotId: 'SL-7890', status: 'available', chargerType: 'Fast Charger', pricePerHour: 50 },
        { slotId: 'SL-7891', status: 'occupied', chargerType: 'Standard Charger', pricePerHour: 30 },
        { slotId: 'SL-7892', status: 'maintenance', chargerType: 'Fast Charger', pricePerHour: 50 },
        { slotId: 'SL-7893', status: 'available', chargerType: 'Ultra Fast Charger', pricePerHour: 80 }
      ]
    });
  }
}