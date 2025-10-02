import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Test database connection by listing collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Test payments collection
    const paymentsCount = await db.collection('payments').countDocuments();
    
    // Test bookings collection
    const bookingsCount = await db.collection('bookings').countDocuments();
    
    // Test stations collection
    const stationsCount = await db.collection('stations').countDocuments();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      collections: collectionNames,
      counts: {
        payments: paymentsCount,
        bookings: bookingsCount,
        stations: stationsCount
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to connect to database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}