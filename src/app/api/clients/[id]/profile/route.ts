import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const { id } = params;
  try {
    const { name, location } = await request.json();

    console.log('Profile API: Updating profile for client ID:', id, 'name:', name, 'location:', location);

    if (!id) {
      return NextResponse.json(
        { error: "Client ID is required" },
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
    const { db, client } = await connectToDatabase();

    // Create ObjectId
    const objectId = new ObjectId(id);

    // Start a session for transactions
    const session = client.startSession();

    try {
      // Start transaction
      const result = await session.withTransaction(async () => {
        const updates: any = { updatedAt: new Date() };
        
        if (name) {
          updates.name = name;
        }
        
        if (location) {
          updates.location = location;
        }

        // Update client's profile fields
        const updateResult = await db.collection("clients").updateOne(
          { _id: objectId },
          { $set: updates },
          { session }
        );

        console.log('Profile API: Update result:', updateResult);

        // Check if the operation was successful
        if (!updateResult || updateResult.modifiedCount === 0) {
          throw new Error("Failed to update client profile - no documents were modified");
        }

        // Fetch the updated client to return the full document
        const updatedClient = await db.collection("clients").findOne({ _id: objectId }, { session });
        
        if (!updatedClient) {
          throw new Error("Client was updated but could not be retrieved");
        }

        // Convert ObjectId to string for JSON serialization
        const serializedClient = {
          ...updatedClient,
          id: updatedClient['_id'].toString(),
          _id: undefined
        };

        console.log('Profile API: Successfully updated client profile:', serializedClient);
        return serializedClient;
      });

      return NextResponse.json(result);
    } catch (transactionError: any) {
      console.error("Transaction failed:", {
        message: transactionError.message,
        stack: transactionError.stack,
        name: transactionError.name
      });
      
      return NextResponse.json(
        { 
          error: "Failed to update client profile",
          details: process.env.NODE_ENV === 'development' ? transactionError.message : undefined
        },
        { status: 500 }
      );
    } finally {
      // End session
      await session.endSession();
    }
  } catch (error: any) {
    console.error("Error updating client profile:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json(
      { 
        error: "Failed to update client profile",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}