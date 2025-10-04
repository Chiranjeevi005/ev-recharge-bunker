import { initRealTimeFeatures } from '@/lib/initRealTime';

// Initialize real-time features when the application starts
export async function startup() {
  console.log('Starting up application...');
  
  try {
    // Initialize real-time features
    const initialized = await initRealTimeFeatures();
    
    if (initialized) {
      console.log('✅ Application startup completed successfully');
    } else {
      console.warn('⚠️ Application startup completed with warnings');
    }
  } catch (error: any) {
    console.error('❌ Error during application startup:', error);
    
    // Provide more specific error messages
    if (error.message && error.message.includes('Authentication failed')) {
      console.error('MongoDB authentication failed. Please check your credentials in .env.local');
    } else if (error.message && error.message.includes('connect ECONNREFUSED')) {
      console.error('MongoDB connection refused. Please check if your MongoDB server is running');
    }
  }
}

// Run startup immediately
startup();