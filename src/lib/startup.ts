import { updateDashboardStats, setupPeriodicStatsUpdates } from './realtime/updateStats';
import redisQueue from './realtime/redisQueue';
import { vercelTimeoutGuard } from '@/utils/vercelTimeoutGuard';

/**
 * Application startup function
 * Initializes all required services and starts background processes
 */
export async function startup() {
  try {
    console.log('Starting application services...');
    
    // Redis queue is already initialized as a module, just check if it's available
    if (redisQueue.isAvailable()) {
      console.log('Redis queue is available');
    } else {
      console.log('Redis queue is not available');
    }
    
    // Set up Vercel timeout guard to prevent 60-second timeout
    const cleanupTimeoutGuard = vercelTimeoutGuard(55000, () => {
      console.log('Vercel timeout guard triggered - performing cleanup');
      // Perform any necessary cleanup before the 60-second Vercel limit
    });
    
    // Update dashboard stats immediately
    console.log('Updating dashboard stats...');
    await updateDashboardStats();
    
    // Set up periodic stats updates (every 30 seconds)
    console.log('Setting up periodic stats updates...');
    setupPeriodicStatsUpdates();
    
    console.log('Application services started successfully');
    
    // Return cleanup function
    return () => {
      // Clean up timeout guard
      cleanupTimeoutGuard();
      console.log('Application services cleaned up');
    };
  } catch (error) {
    console.error('Error during application startup:', error);
    throw error;
  }
}