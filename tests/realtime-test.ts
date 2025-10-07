import { initRealTimeFeatures } from '../src/lib/realtime/initRealTime';
import { updateDashboardStats } from '../src/lib/realtime/updateStats';

async function testRealTimeFeatures() {
  console.log('Testing real-time features...');
  
  try {
    // Test real-time feature initialization
    const realTimeInitialized = await initRealTimeFeatures();
    console.log('Real-time features initialized:', realTimeInitialized);
    
    // Test dashboard stats update
    await updateDashboardStats();
    console.log('Dashboard stats updated successfully');
    
    console.log('✅ All real-time features are working correctly!');
  } catch (error) {
    console.error('❌ Error testing real-time features:', error);
  }
}

testRealTimeFeatures();