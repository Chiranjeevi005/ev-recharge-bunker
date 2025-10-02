import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';

// Test function to verify database connection and data structure
export async function testDataConnection() {
  try {
    // Test MongoDB connection
    const { db } = await connectToDatabase();
    console.log('✅ Connected to MongoDB');
    
    // Test collections
    const collections = await db.listCollections().toArray();
    console.log('📚 Available collections:', collections.map(c => c.name));
    
    // Test users collection
    const usersCount = await db.collection('users').countDocuments();
    console.log('👥 Users count:', usersCount);
    
    // Test stations collection
    const stationsCount = await db.collection('stations').countDocuments();
    console.log('🔌 Stations count:', stationsCount);
    
    // Test charging_sessions collection
    const sessionsCount = await db.collection('charging_sessions').countDocuments();
    console.log('⚡ Charging sessions count:', sessionsCount);
    
    // Test payments collection
    const paymentsCount = await db.collection('payments').countDocuments();
    console.log('💰 Payments count:', paymentsCount);
    
    return true;
  } catch (error) {
    console.error('❌ Error testing data connection:', error);
    return false;
  }
}

// Run the test
testDataConnection().then(success => {
  if (success) {
    console.log('✅ All tests passed');
  } else {
    console.log('❌ Some tests failed');
  }
});