import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import redis from '@/lib/realtime/redis';
import { withRateLimit } from '@/lib/rateLimit';

// Helper function to calculate percentage change
async function calculatePercentageChange(db: any, collectionName: string, fieldName: string, statusFilter?: any) {
  try {
    // Get current month start and previous month start
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let currentCount = 0;
    let previousCount = 0;
    
    if (statusFilter) {
      // For payments, filter by status
      currentCount = await db.collection(collectionName).countDocuments({
        ...statusFilter,
        createdAt: { $gte: currentMonthStart }
      });
      
      previousCount = await db.collection(collectionName).countDocuments({
        ...statusFilter,
        createdAt: { $gte: previousMonthStart, $lt: previousMonthEnd }
      });
    } else {
      // For other collections
      currentCount = await db.collection(collectionName).countDocuments({
        createdAt: { $gte: currentMonthStart }
      });
      
      previousCount = await db.collection(collectionName).countDocuments({
        createdAt: { $gte: previousMonthStart, $lt: previousMonthEnd }
      });
    }
    
    if (previousCount === 0) {
      return currentCount > 0 ? 100 : 0;
    }
    
    const change = ((currentCount - previousCount) / previousCount) * 100;
    return Math.round(change);
  } catch (error) {
    console.error(`Error calculating percentage change for ${collectionName}:`, error);
    return 0;
  }
}

export const GET = withRateLimit(async (_request: Request) => {
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
    const uniqueLocations = await db.collection("stations").distinct("city");
    const totalLocations = uniqueLocations.length;
    
    // Get total revenue from completed payments
    const payments = await db.collection("payments").find({ 
      status: "completed" 
    }).toArray();
    
    const totalRevenue = payments.reduce((sum, payment) => sum + (payment['amount'] || 0), 0);
    
    // Calculate percentage changes
    const userChange = await calculatePercentageChange(db, "clients", "createdAt");
    const stationChange = await calculatePercentageChange(db, "stations", "createdAt", { status: "active" });
    const locationChange = 0; // This is harder to calculate accurately without historical data
    const revenueChange = await calculatePercentageChange(db, "payments", "amount", { status: "completed" });
    
    // Prepare stats data as requested
    const stats = [
      {
        id: '1',
        name: 'Users',
        value: totalUsers,
        change: userChange,
        color: 'from-[#8B5CF6] to-[#10B981]',
        icon: 'user-group'
      },
      {
        id: '2',
        name: 'Stations',
        value: activeStations,
        change: stationChange,
        color: 'from-[#10B981] to-[#059669]',
        icon: 'lightning-bolt'
      },
      {
        id: '3',
        name: 'Locations',
        value: totalLocations,
        change: locationChange,
        color: 'from-[#F59E0B] to-[#D97706]',
        icon: 'clock'
      },
      {
        id: '4',
        name: 'Revenue',
        value: totalRevenue,
        change: revenueChange,
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
      { error: errorMessage, details: error.message }, 
      { status: 500 }
    );
  }
});