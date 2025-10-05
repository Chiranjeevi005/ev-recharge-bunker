import type { Payment } from '../types/payment';
import { connectToDatabase } from '@/lib/db/connection';
import redis from '@/lib/redis';

/**
 * Update dashboard stats in Redis cache
 * This function is meant to be called periodically to keep stats up to date
 */
export async function updateDashboardStats() {
  try {
    // Only run if Redis is available
    if (!redis.isAvailable()) {
      console.log('Redis not available, skipping stats update');
      return;
    }

    // Add timeout to database connection
    const dbPromise = connectToDatabase();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout')), 5000)
    );
    
    const { db } = await Promise.race([dbPromise, timeoutPromise]) as { db: any };
    
    // Get total users count with timeout
    const totalUsersPromise = db.collection("clients").countDocuments();
    const totalUsers = await Promise.race([
      totalUsersPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Users count timeout')), 3000))
    ]);
    
    // Get active stations count with timeout
    const activeStationsPromise = db.collection("stations").countDocuments({ 
      status: "active" 
    });
    const activeStations = await Promise.race([
      activeStationsPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Stations count timeout')), 3000))
    ]);
    
    // Get unique locations count with timeout
    const uniqueLocationsPromise = db.collection("stations").distinct("location");
    const uniqueLocations = await Promise.race([
      uniqueLocationsPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Locations count timeout')), 3000))
    ]);
    const totalLocations = uniqueLocations.length;
    
    // Get total revenue from completed payments with timeout
    const paymentsPromise = db.collection("payments").find({ 
      status: "completed" 
    }).toArray();
    const payments: Payment[] = await Promise.race([
      paymentsPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Payments fetch timeout')), 3000))
    ]);
    
    const totalRevenue = payments.reduce((sum: number, payment: Payment) => sum + (payment.amount || 0), 0);
    
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
    
    // Publish stats update to Redis channel for real-time updates
    await redis.publish('stats_update', JSON.stringify(stats));
    
    console.log('Dashboard stats updated successfully');
    return stats;
  } catch (error: any) {
    console.error('Error updating dashboard stats:', error);
    // Don't throw the error to prevent breaking the periodic updates
    return null;
  }
}

/**
 * Set up periodic stats updates
 * This function sets up an interval to update stats every 30 seconds
 */
export function setupPeriodicStatsUpdates() {
  // Update stats immediately
  updateDashboardStats().catch(console.error);
  
  // Update stats every 30 seconds
  const intervalId = setInterval(() => {
    updateDashboardStats().catch(console.error);
  }, 30000); // 30 seconds
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
  };
}