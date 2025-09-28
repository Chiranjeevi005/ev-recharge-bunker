import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
  try {
    console.log('DATABASE_URL from env:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    console.log('DATABASE_URL value:', process.env.DATABASE_URL);
    
    // Check if it contains ev_bunker
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('ev_bunker')) {
      console.log('DATABASE_URL contains ev_bunker');
    } else {
      console.log('DATABASE_URL does not contain ev_bunker');
    }
    
    // Test MongoDB connection directly
    console.log('Testing MongoDB connection directly...');
    const client = new MongoClient(process.env.DATABASE_URL!);
    await client.connect();
    console.log('Connected to MongoDB directly');
    
    // Explicitly specify the database name
    const db = client.db('ev_bunker');
    console.log('Database name:', db.databaseName);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    const stations = await db.collection('stations').find({}).toArray();
    console.log('Stations count:', stations.length);
    
    await client.close();
    
    return NextResponse.json({
      databaseUrlSet: !!process.env.DATABASE_URL,
      databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      containsEvBunker: process.env.DATABASE_URL ? process.env.DATABASE_URL.includes('ev_bunker') : false,
      collections: collections.map(c => c.name),
      stationsCount: stations.length
    });
  } catch (error: any) {
    console.error("Error checking environment:", error);
    return NextResponse.json(
      { error: "Failed to check environment", details: error.message }, 
      { status: 500 }
    );
  }
}