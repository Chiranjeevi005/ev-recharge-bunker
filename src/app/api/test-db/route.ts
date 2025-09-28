import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';

export async function GET() {
  try {
    console.log('DATABASE_URL from env:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    
    const { client, db } = await connectToDatabase();
    console.log('Connected to database successfully');
    console.log('Database name:', db.databaseName);
    
    // List all collections to see what's available
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    const stations = await db.collection('stations').find({}).toArray();
    console.log('Found', stations.length, 'stations');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection working',
      databaseName: db.databaseName,
      collections: collections.map(c => c.name),
      stationCount: stations.length
    });
  } catch (error: any) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}