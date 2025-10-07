import { connectToDatabase } from "@/lib/db/connection";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { location } = await request.json();

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

    const { db } = await connectToDatabase();

    // Create ObjectId
    const objectId = new ObjectId(id);

    // Check if client exists
    const existingClient = await db.collection("clients").findOne({ _id: objectId });

    if (!existingClient) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Update client location
    const result = await db.collection("clients").updateOne(
      { _id: objectId },
      { $set: { location } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Fetch updated client
    const updatedClient = await db.collection("clients").findOne({ _id: objectId });
    
    // Remove sensitive fields and serialize ObjectId
    if (updatedClient) {
      const { googleId, ...serializedClient } = updatedClient;
      return NextResponse.json({
        success: true,
        client: {
          ...serializedClient,
          id: serializedClient['_id'].toString(),
          _id: undefined
        }
      });
    } else {
      return NextResponse.json({
        success: true,
        client: null
      });
    }

  } catch (error) {
    console.error("Error updating client location");
    return NextResponse.json(
      { 
        error: "Failed to update client location",
        details: process.env.NODE_ENV === 'development' ? 'Check server logs for details' : undefined
      },
      { status: 500 }
    );
  }
}