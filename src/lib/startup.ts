import redis from './realtime/redisQueue';
import { setupPeriodicStatsUpdates } from './realtime/updateStats';
import { ensureDatabaseIndexes } from './db/indexes';

export async function startup() {
  console.log('Starting up application services...');
  
  // Ensure database indexes are created with timeout
  try {
    // Add timeout to index creation
    const indexesPromise = ensureDatabaseIndexes();
    const timeoutPromise = new Promise<boolean>((_, reject) => 
      setTimeout(() => reject(new Error('Database index creation timeout')), 10000)
    );
    
    const indexesCreated = await Promise.race([indexesPromise, timeoutPromise]);
    if (indexesCreated) {
      console.log('✅ Database indexes ensured');
    } else {
      console.warn('⚠️  Failed to create database indexes');
    }
  } catch (error) {
    console.warn('⚠️  Database index creation timed out or failed:', error);
  }
  
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