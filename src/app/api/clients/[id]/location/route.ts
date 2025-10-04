import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { location } = await request.json();
    const { id } = params;

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

    // Update client's location - ensure we're handling the case where location field doesn't exist yet
    const result = await db.collection("clients").updateOne(
      { _id: objectId },
      { 
        $set: { 
          location: location, 
          updatedAt: new Date() 
        } 
      }
    );

    console.log('Location API: Update result:', result);

    // Check if the operation was successful
    if (!result || result.modifiedCount === 0) {
      // Provide more detailed error information
      return NextResponse.json(
        { 
          error: "Failed to update client location",
          details: "Database update operation failed - no documents were modified",
          clientId: id
        },
        { status: 500 }
      );
    }

    // Fetch the updated client to return the full document
    const updatedClient = await db.collection("clients").findOne({ _id: objectId });
    
    if (!updatedClient) {
      return NextResponse.json(
        { 
          error: "Failed to fetch updated client",
          details: "Client was updated but could not be retrieved",
          clientId: id
        },
        { status: 500 }
      );
    }

    // Convert ObjectId to string for JSON serialization
    const serializedClient = {
      ...updatedClient,
      id: updatedClient['_id'].toString(),
      _id: undefined
    };

    console.log('Location API: Successfully updated client location:', serializedClient);
    return NextResponse.json(serializedClient);
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