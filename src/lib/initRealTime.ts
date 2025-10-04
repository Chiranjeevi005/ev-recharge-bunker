import { initializeChangeStreams } from '@/lib/db/changeStreams';

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