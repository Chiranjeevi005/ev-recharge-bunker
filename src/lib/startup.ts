import redis from './redis';
import { setupPeriodicStatsUpdates } from './updateStats';
import { ensureDatabaseIndexes } from './db/indexes';

export async function startup() {
  console.log('Starting up application services...');
  
  // Ensure database indexes are created
  const indexesCreated = await ensureDatabaseIndexes();
  if (indexesCreated) {
    console.log('✅ Database indexes ensured');
  } else {
    console.warn('⚠️  Failed to create database indexes');
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