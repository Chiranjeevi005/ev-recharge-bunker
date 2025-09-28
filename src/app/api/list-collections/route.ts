import { NextResponse } from 'next/server';
import { connectToDatabaseForAPI } from '@/lib/db/api-connection';

export async function GET() {
  try {
    console.log('Connecting to database to list collections...');
    const { db } = await connectToDatabaseForAPI();
    console.log('Connected to database for listing collections:', db.databaseName);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    return NextResponse.json({
      database: db.databaseName,
      collections: collections.map(c => c.name)
    });
  } catch (error: any) {
    console.error("Error listing collections:", error);
    return NextResponse.json(
      { error: "Failed to list collections", details: error.message }, 
      { status: 500 }
    );
  }
}