import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import redis from '@/lib/redis';

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
        const impactKey = `environmental-impact:${userId}`;
        const cachedImpact = await redis.get(impactKey);
        
        if (cachedImpact) {
          return NextResponse.json(JSON.parse(cachedImpact));
        }
      } catch (redisError) {
        console.error("Error fetching environmental impact from Redis:", redisError);
      }
    }

    // If not in Redis or Redis not available, calculate from MongoDB
    const { db } = await connectToDatabase();
    
    // Calculate total CO2 saved (assuming 0.5 kg CO2 per kWh)
    const sessions = await db.collection("charging_sessions").find({ 
      userId: userId,
      status: "completed"
    }).toArray();
    
    let totalEnergyKWh = 0;
    let sessionsCompleted = 0;
    
    sessions.forEach(session => {
      totalEnergyKWh += session.totalEnergyKWh || 0;
      sessionsCompleted++;
    });
    
    const co2Saved = Math.round(totalEnergyKWh * 0.5); // 0.5 kg CO2 per kWh
    const treesSaved = Math.round(co2Saved / 40); // Approximately 40 kg CO2 saved per tree per year
    
    const environmentalImpact = {
      co2Saved,
      sessionsCompleted,
      totalEnergyKWh,
      treesSaved
    };

    // Cache in Redis for 5 minutes (if available)
    if (redis.isAvailable()) {
      try {
        await redis.setex(`environmental-impact:${userId}`, 300, JSON.stringify(environmentalImpact));
      } catch (redisError) {
        console.error("Error caching environmental impact in Redis:", redisError);
      }
    }

    return NextResponse.json(environmentalImpact);
  } catch (error) {
    console.error("Error fetching environmental impact:", error);
    return NextResponse.json(
      { error: "Failed to fetch environmental impact" }, 
      { status: 500 }
    );
  }
}