import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { Db } from 'mongodb';
import redis from '@/lib/realtime/redisQueue';
import { withRateLimit } from '@/lib/rateLimit';

// Add timeout utility
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  const timeout = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]) as Promise<T>;
};

// Helper function to calculate percentage change
async function calculatePercentageChange(db: Db, collectionName: string, fieldName: string, statusFilter?: any) {
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
      currentCount = await withTimeout(db.collection(collectionName).countDocuments({
        ...statusFilter,
        createdAt: { $gte: currentMonthStart }
      }), 3000);
      
      previousCount = await withTimeout(db.collection(collectionName).countDocuments({
        ...statusFilter,
        createdAt: { $gte: previousMonthStart, $lt: previousMonthEnd }
      }), 3000);
    } else {
      // For other collections
      currentCount = await withTimeout(db.collection(collectionName).countDocuments({
        createdAt: { $gte: currentMonthStart }
      }), 3000);
      
      previousCount = await withTimeout(db.collection(collectionName).countDocuments({
        createdAt: { $gte: previousMonthStart, $lt: previousMonthEnd }
      }), 3000);
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
    // Add overall timeout for the entire request
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout after 20 seconds')), 20000)
    );
    
    const responsePromise = handleStatsRequest();
    
    return await Promise.race([responsePromise, timeoutPromise]);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to fetch dashboard stats";
    if (error instanceof Error) {
      if (error.message.includes('Authentication failed')) {
        errorMessage = "Database authentication failed. Please check your MongoDB credentials.";
      } else if (error.message.includes('connect ECONNREFUSED')) {
        errorMessage = "Database connection refused. Please check if your MongoDB server is running.";
      } else if (error.message.includes('timeout')) {
        errorMessage = "Request timeout. Database query took too long to complete.";
      } else {
        errorMessage = error.message;
      }
    }
    
    // Create response with cache-busting headers
    const response = NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    );
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  }
});

async function handleStatsRequest() {
  try {
    // Try to get from Redis cache first
    if (redis.isAvailable()) {
      try {
        const cachedStats = await redis.get('dashboard_stats');
        if (cachedStats) {
          console.log('Returning cached dashboard stats from Redis');
          const response = NextResponse.json(JSON.parse(cachedStats));
          response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          response.headers.set('Pragma', 'no-cache');
          response.headers.set('Expires', '0');
          return response;
        }
      } catch (redisError) {
        console.error("Error fetching dashboard stats from Redis:", redisError);
      }
    }

    const { db } = await connectToDatabase();
    const typedDb = db as Db;
    
    console.log('Connected to database, counting clients...');
    
    // Get total users count with timeout
    const totalUsersPromise = withTimeout(typedDb.collection("clients").countDocuments(), 5000);
    const totalUsers = await totalUsersPromise;
    console.log('Total users count:', totalUsers);
    
    // Get active stations count with timeout
    const activeStationsPromise = withTimeout(typedDb.collection("stations").countDocuments({ 
      status: "active" 
    }), 5000);
    const activeStations = await activeStationsPromise;
    console.log('Active stations count:', activeStations);
    
    // Get unique locations count with timeout
    const uniqueLocationsPromise = withTimeout(typedDb.collection("stations").distinct("city"), 5000);
    const uniqueLocations = await uniqueLocationsPromise;
    const totalLocations = uniqueLocations.length;
    console.log('Unique locations count:', totalLocations);
    
    // Get total revenue from completed payments with timeout
    const paymentsPromise = withTimeout(typedDb.collection("payments").find({ 
      status: "completed" 
    }).toArray(), 10000);
    const payments = await paymentsPromise;
    console.log('Completed payments count:', payments.length);
    
    const totalRevenue = payments.reduce((sum, payment) => sum + (payment['amount'] || 0), 0);
    console.log('Total revenue:', totalRevenue);
    
    // Calculate percentage changes with timeouts
    const userChangePromise = calculatePercentageChange(typedDb, "clients", "createdAt");
    const stationChangePromise = calculatePercentageChange(typedDb, "stations", "createdAt", { status: "active" });
    const revenueChangePromise = calculatePercentageChange(typedDb, "payments", "amount", { status: "completed" });
    
    const [userChange, stationChange, revenueChange] = await Promise.all([
      userChangePromise,
      stationChangePromise,
      revenueChangePromise
    ]);
    
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
        change: 0, // This is harder to calculate accurately without historical data
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

    console.log('Stats data:', stats);

    // Cache stats in Redis for 5 minutes
    if (redis.isAvailable()) {
      await redis.setex('dashboard_stats', 300, JSON.stringify(stats));
    }

    // Create response with cache-busting headers
    const response = NextResponse.json(stats);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
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
    
    // Create response with cache-busting headers
    const response = NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    );
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  }
}