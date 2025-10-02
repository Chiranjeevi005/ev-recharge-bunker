import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    console.log('Test API: Connecting to database');
    const { db } = await connectToDatabase();
    console.log('Test API: Connected to database');
    
    // Find a test client
    const client = await db.collection("clients").findOne({});
    console.log('Test API: Found client:', client);
    
    if (client) {
      // Update client's location to Bangalore
      const result = await db.collection("clients").findOneAndUpdate(
        { _id: client._id },
        { $set: { location: "Bangalore", updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      
      console.log('Test API: Update result:', result);
      
      // Verify the update
      const updatedClient = await db.collection("clients").findOne({ _id: client._id });
      console.log('Test API: Updated client:', updatedClient);
      
      return NextResponse.json({
        message: 'Location updated successfully',
        originalClient: client,
        updatedClient: updatedClient
      });
    } else {
      return NextResponse.json({ message: 'No clients found' });
    }
  } catch (error: any) {
    console.error('Test API: Error updating location:', error);
    return NextResponse.json({ error: 'Failed to update location', details: error.message }, { status: 500 });
  }
}