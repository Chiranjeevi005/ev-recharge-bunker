import { initializeChangeStreams, closeChangeStreams } from '@/lib/db/changeStreams';

export async function initRealTimeFeatures() {
  console.log('Initializing real-time features...');
  
  // Initialize MongoDB change streams
  const changeStreamsInitialized = await initializeChangeStreams();
  
  if (changeStreamsInitialized) {
    console.log('✅ Real-time features initialized successfully');
  } else {
    console.error('❌ Failed to initialize real-time features');
  }
  
  return changeStreamsInitialized;
}

// Cleanup function to properly close real-time features
export function cleanupRealTimeFeatures() {
  console.log('Cleaning up real-time features...');
  closeChangeStreams();
  console.log('✅ Real-time features cleaned up successfully');
}