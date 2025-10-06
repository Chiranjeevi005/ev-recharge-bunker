import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const { id } = params;
  try {
    const { name } = await request.json();

    console.log('Name API: Updating name for client ID:', id, 'to name:', name);

    if (!id || !name) {
      return NextResponse.json(
        { error: "Client ID and name are required" },
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
    
    console.log('Name API: Existing client:', existingClient);

    if (!existingClient) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Update client's name - use updateOne for more reliable operation
    const result = await db.collection("clients").updateOne(
      { _id: objectId },
      { $set: { name, updatedAt: new Date() } }
    );

    console.log('Name API: Update result:', result);

    // Check if the operation was successful
    if (!result || result.modifiedCount === 0) {
      return NextResponse.json(
        { 
          error: "Failed to update client name",
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

    console.log('Name API: Successfully updated client name:', serializedClient);
    return NextResponse.json(serializedClient);
  } catch (error: any) {
    console.error("Error updating client name:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json(
      { 
        error: "Failed to update client name",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}