import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import redis from '@/lib/realtime/redis';

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

    // Try to fetch from Redis first (if available)
    if (redis.isAvailable()) {
      try {
        const impactKey = `journey-impact:${userId}`;
        const cachedImpact = await redis.get(impactKey);
        
        if (cachedImpact) {
          console.log('Returning cached journey impact stats from Redis');
          return NextResponse.json(JSON.parse(cachedImpact));
        }
      } catch (redisError) {
        console.error("Error fetching journey impact stats from Redis:", redisError);
      }
    }

    // If not in Redis or Redis not available, calculate from MongoDB
    const { db } = await connectToDatabase();
    
    // Get all confirmed bookings for the user (using bookings collection instead of charging_sessions)
    const bookings = await db.collection("bookings").find({ 
      userId: userId,
      status: "confirmed"
    }).toArray();
    
    // Calculate totals
    let totalKWh = 0;
    let totalDuration = 0; // in minutes
    
    bookings.forEach(booking => {
      // Estimate energy based on duration (assuming 1 kWh per hour as a simple estimate)
      // In a real implementation, this would come from actual charging data
      const durationHours = (new Date(booking["endTime"]).getTime() - new Date(booking["startTime"]).getTime()) / (1000 * 60 * 60);
      const estimatedEnergyKWh = durationHours * 1; // Simple estimate
      
      totalKWh += estimatedEnergyKWh;
      
      // Calculate duration from startTime and endTime
      if (booking["startTime"] && booking["endTime"]) {
        const start = new Date(booking["startTime"]);
        const end = new Date(booking["endTime"]);
        const durationInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
        totalDuration += durationInMinutes;
      }
    });
    
    // Calculate business metrics based on formulas provided
    // Constants
    const KM_PER_KWH = 6;
    const CO2_PER_KWH = 0.85; // kg
    const PETROL_COST_PER_KM = 6.5;
    const EV_COST_PER_KM = 1.5;
    
    // Calculate metrics
    const totalEnergy = totalKWh;
    const co2Prevented = totalEnergy * CO2_PER_KWH; // kg CO₂
    const totalDistance = totalEnergy * KM_PER_KWH; // km
    const costSavings = totalDistance * (PETROL_COST_PER_KM - EV_COST_PER_KM); // ₹
    
    // For community CO2 saved, we'll need to get the total for all users
    const allBookings = await db.collection("bookings").find({ 
      status: "confirmed"
    }).toArray();
    
    // Calculate community CO2 saved
    let communityCO2Saved = 0;
    allBookings.forEach(booking => {
      const durationHours = (new Date(booking["endTime"]).getTime() - new Date(booking["startTime"]).getTime()) / (1000 * 60 * 60);
      const estimatedEnergyKWh = durationHours * 1; // Simple estimate
      communityCO2Saved += estimatedEnergyKWh * CO2_PER_KWH;
    });
    
    // Add community CO2 saved to the response
    const journeyImpactStats = {
      totalKWh: parseFloat(totalEnergy.toFixed(2)),
      totalDuration: Math.round(totalDuration),
      co2Prevented: Math.round(co2Prevented),
      costSavings: Math.round(costSavings),
      communityCO2Saved: Math.round(communityCO2Saved), // Add community CO2 saved to the response
      // Keep original values for potential reuse
      totalDistance: parseFloat(totalDistance.toFixed(2)),
    };

    // Cache in Redis for 60 seconds
    if (redis.isAvailable()) {
      try {
        await redis.setex(`journey-impact:${userId}`, 60, JSON.stringify(journeyImpactStats));
      } catch (redisError) {
        console.error("Error caching journey impact stats in Redis:", redisError);
      }
    }

    return NextResponse.json(journeyImpactStats);
  } catch (error) {
    console.error("Error fetching journey impact stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch journey impact stats" }, 
      { status: 500 }
    );
  }
}