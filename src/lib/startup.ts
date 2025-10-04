import redis from './redis';
import { setupPeriodicStatsUpdates } from './updateStats';

export async function startup() {
  console.log('Starting up application services...');
  
  // Initialize Redis if available
  if (redis.isAvailable()) {
    console.log('Redis is available, setting up services...');
    
    // Set up periodic stats updates
    const cleanupStats = setupPeriodicStatsUpdates();
    
    // Return cleanup functions
    return () => {
      console.log('Cleaning up application services...');
      cleanupStats();
    };
  } else {
    console.log('Redis not available, running in fallback mode');
    return () => {
      console.log('Cleaning up application services...');
    };
  }
}