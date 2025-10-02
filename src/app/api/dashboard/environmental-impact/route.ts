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
        const impactKey = `business-stats:${userId}`;
        const cachedImpact = await redis.get(impactKey);
        
        if (cachedImpact) {
          return NextResponse.json(JSON.parse(cachedImpact));
        }
      } catch (redisError) {
        console.error("Error fetching business stats from Redis:", redisError);
      }
    }

    // If not in Redis or Redis not available, calculate from MongoDB
    const { db } = await connectToDatabase();
    
    // Get all completed charging sessions for the user (last 24 hours for more frequent updates)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const sessions = await db.collection("charging_sessions").find({ 
      userId: userId,
      status: "completed",
      createdAt: { $gte: twentyFourHoursAgo }
    }).toArray();
    
    // Calculate totals
    let totalKWh = 0;
    let totalDistance = 0;
    let totalPayments = 0;
    
    sessions.forEach(session => {
      totalKWh += session["totalEnergyKWh"] || 0;
      totalPayments += session["totalCost"] || 0;
    });
    
    // Calculate business metrics based on formulas provided
    // Constants
    const PETROL_COST_PER_KM = 6.5;
    const EV_COST_PER_KM = 1.5;
    const AVG_KM_PER_LITER = 15;
    const KM_PER_KWH = 6;
    const CO2_PER_KWH = 0.85; // kg
    const CO2_PER_KM_PETROL = 0.12; // kg CO2/km for petrol
    
    // Calculate metrics with minimum values to keep users motivated
    totalDistance = totalKWh * KM_PER_KWH;
    const fuelSavings = Math.max(10, totalDistance * (PETROL_COST_PER_KM - EV_COST_PER_KM)); // Minimum ₹10
    const petrolOffset = Math.max(5, totalDistance / AVG_KM_PER_LITER); // Minimum 5 liters
    const co2Saved = Math.max(1, totalKWh * CO2_PER_KWH); // Minimum 1 kg
    
    // Calculate trees equivalent (21 kg CO2 per tree per year) - minimum 1 tree
    const treesSaved = Math.max(1, Math.round(co2Saved / 21));
    
    // For community CO2 saved, we'll need to get the total for all users (last 24 hours)
    const allSessions = await db.collection("charging_sessions").find({ 
      status: "completed",
      createdAt: { $gte: twentyFourHoursAgo }
    }).toArray();
    
    let communityCO2Saved = 0;
    allSessions.forEach(session => {
      communityCO2Saved += (session["totalEnergyKWh"] || 0) * CO2_PER_KWH;
    });
    
    // Calculate user's contribution percentage - minimum 1%
    const evRevolutionContribution = communityCO2Saved > 0 ? Math.max(1, (co2Saved / communityCO2Saved) * 100) : 1;
    
    // Calculate user's rank (simplified - in a real app, you'd compare with users in the same city)
    // For now, we'll simulate a rank based on CO2 saved (last 24 hours)
    const allUsersCO2 = await db.collection("charging_sessions").aggregate([
      { $match: { status: "completed", createdAt: { $gte: twentyFourHoursAgo } } },
      { $group: { _id: "$userId", totalCO2: { $sum: { $multiply: ["$totalEnergyKWh", CO2_PER_KWH] } } } },
      { $sort: { totalCO2: -1 } }
    ]).toArray();
    
    // Find user's position
    const userIndex = allUsersCO2.findIndex(user => user["_id"] === userId);
    const userRank = userIndex !== -1 ? userIndex + 1 : allUsersCO2.length + 1;
    const rankPercentile = allUsersCO2.length > 0 ? Math.max(1, Math.round((1 - (userRank / allUsersCO2.length)) * 100)) : 1;
    
    const businessStats = {
      fuelSavings: Math.round(fuelSavings),
      petrolOffset: Math.round(petrolOffset),
      evDistance: Math.max(30, Math.round(totalDistance)), // Minimum 30 km
      evContribution: parseFloat(evRevolutionContribution.toFixed(2)),
      co2Saved: Math.round(co2Saved),
      treesSaved: treesSaved,
      rankPercentile: rankPercentile,
      // Keep original values for potential reuse
      totalKWh,
      totalDistance,
      totalPayments,
    };

    // Cache in Redis for 1 minute (if available) - more frequent updates for motivation
    if (redis.isAvailable()) {
      try {
        await redis.setex(`business-stats:${userId}`, 60, JSON.stringify(businessStats));
      } catch (redisError) {
        console.error("Error caching business stats in Redis:", redisError);
      }
    }

    return NextResponse.json(businessStats);
  } catch (error) {
    console.error("Error fetching business stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch business stats" }, 
      { status: 500 }
    );
  }
}