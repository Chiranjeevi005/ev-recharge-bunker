import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { name } = await request.json();
    const resolvedParams = await params;
    const { id } = resolvedParams;

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

    // Update client's name
    const result = await db.collection("clients").findOneAndUpdate(
      { _id: objectId },
      { $set: { name, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    console.log('Name API: Update result:', result);

    // Check if the operation was successful
    if (!result || !result['value']) {
      // Even if findOneAndUpdate didn't return the updated document, 
      // let's fetch the client to verify the update
      const updatedClient = await db.collection("clients").findOne({ _id: objectId });
      console.log('Name API: Updated client verification:', updatedClient);
      
      if (updatedClient && updatedClient['name'] === name) {
        // Convert ObjectId to string for JSON serialization
        const serializedClient = {
          ...updatedClient,
          id: updatedClient['_id'].toString(),
          _id: undefined
        };
        console.log('Name API: Successfully updated client name');
        return NextResponse.json(serializedClient);
      }
      
      return NextResponse.json(
        { error: "Failed to update client name" },
        { status: 500 }
      );
    }

    // Convert ObjectId to string for JSON serialization
    const updatedClient = {
      ...result['value'],
      id: result['value']['_id'].toString(),
      _id: undefined
    };

    console.log('Name API: Successfully updated client name:', updatedClient);
    return NextResponse.json(updatedClient);
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