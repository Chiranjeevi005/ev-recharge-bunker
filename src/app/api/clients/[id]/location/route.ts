import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { location } = await request.json();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    console.log('Location API: Updating location for client ID:', id, 'to location:', location);

    if (!id || !location) {
      return NextResponse.json(
        { error: "Client ID and location are required" },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid client ID format" },
        { status: 400 }
      );
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Create ObjectId
    const objectId = new ObjectId(id);

    // First, check if client exists
    const existingClient = await db.collection("clients").findOne({ _id: objectId });
    
    console.log('Location API: Existing client:', existingClient);

    if (!existingClient) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Update client's location
    const result = await db.collection("clients").findOneAndUpdate(
      { _id: objectId },
      { $set: { location, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    console.log('Location API: Update result:', result);

    // Check if the operation was successful
    if (!result || !result['value']) {
      // Even if findOneAndUpdate didn't return the updated document, 
      // let's fetch the client to verify the update
      const updatedClient = await db.collection("clients").findOne({ _id: objectId });
      console.log('Location API: Updated client verification:', updatedClient);
      
      if (updatedClient && updatedClient['location'] === location) {
        // Convert ObjectId to string for JSON serialization
        const serializedClient = {
          ...updatedClient,
          id: updatedClient['_id'].toString(),
          _id: undefined
        };
        console.log('Location API: Successfully updated client location');
        return NextResponse.json(serializedClient);
      }
      
      // Provide more detailed error information
      return NextResponse.json(
        { 
          error: "Failed to update client location",
          details: "Database update operation failed",
          clientId: id
        },
        { status: 500 }
      );
    }

    // Convert ObjectId to string for JSON serialization
    const updatedClient = {
      ...result['value'],
      id: result['value']['_id'].toString(),
      _id: undefined
    };

    console.log('Location API: Successfully updated client location:', updatedClient);
    return NextResponse.json(updatedClient);
  } catch (error: any) {
    console.error("Error updating client location:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json(
      { 
        error: "Failed to update client location",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}