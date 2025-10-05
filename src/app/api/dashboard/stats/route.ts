import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import redis from '@/lib/redis';
import { withRateLimit } from '@/lib/rateLimit';

export const GET = withRateLimit(async (request: Request) => {
  try {
    // Try to get stats from Redis cache first
    const cachedStats = await redis.get('dashboard_stats');
    if (cachedStats) {
      console.log('Returning cached stats from Redis');
      return NextResponse.json(JSON.parse(cachedStats));
    }

    const { db } = await connectToDatabase();
    
    // Get total users count
    const totalUsers = await db.collection("clients").countDocuments();
    
    // Get active stations count
    const activeStations = await db.collection("stations").countDocuments({ 
      status: "active" 
    });
    
    // Get unique locations count
    const uniqueLocations = await db.collection("stations").distinct("location");
    const totalLocations = uniqueLocations.length;
    
    // Get total revenue from completed payments
    const payments = await db.collection("payments").find({ 
      status: "completed" 
    }).toArray();
    
    const totalRevenue = payments.reduce((sum, payment) => sum + (payment['amount'] || 0), 0);
    
    // Prepare stats data as requested
    const stats = [
      {
        id: '1',
        name: 'Users',
        value: totalUsers,
        change: 0, // Would calculate based on previous period in real implementation
        color: 'from-[#8B5CF6] to-[#10B981]',
        icon: 'user-group'
      },
      {
        id: '2',
        name: 'Stations',
        value: activeStations,
        change: 0,
        color: 'from-[#10B981] to-[#059669]',
        icon: 'lightning-bolt'
      },
      {
        id: '3',
        name: 'Locations',
        value: totalLocations,
        change: 0,
        color: 'from-[#F59E0B] to-[#D97706]',
        icon: 'clock'
      },
      {
        id: '4',
        name: 'Revenue',
        value: totalRevenue,
        change: 0,
        color: 'from-[#EF4444] to-[#DC2626]',
        icon: 'currency-rupee'
      }
    ];

    // Cache stats in Redis for 5 minutes
    await redis.setex('dashboard_stats', 300, JSON.stringify(stats));

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to fetch dashboard stats";
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
});