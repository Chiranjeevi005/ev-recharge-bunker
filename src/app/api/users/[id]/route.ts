import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';
import aj from '@/lib/arcjet';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Apply Arcjet protection
    const decision = await aj.protect(request);
    
    if (decision.isDenied()) {
      return NextResponse.json(
        { error: "Too many requests" }, 
        { status: 429 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Await params before using
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    console.log("Fetching user with ID:", id);
    
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid user ID format" }, 
        { status: 400 }
      );
    }
    
    // Fetch user by ID
    const user = await db.collection("users").findOne({ 
      _id: new ObjectId(id) 
    });
    
    console.log("User found:", user ? "Yes" : "No");
    
    if (!user) {
      // Also check in clients collection
      const client = await db.collection("clients").findOne({ 
        _id: new ObjectId(id) 
      });
      
      console.log("Client found:", client ? "Yes" : "No");
      
      if (!client) {
        return NextResponse.json(
          { error: "User not found", userId: id }, 
          { status: 404 }
        );
      }
      
      // Convert ObjectId to string for JSON serialization
      const serializedClient = {
        ...client,
        id: client._id.toString(),
        _id: undefined
      };
      
      return NextResponse.json(serializedClient);
    }
    
    // Convert ObjectId to string for JSON serialization
    const serializedUser = {
      ...user,
      id: user._id.toString(),
      _id: undefined
    };
    
    return NextResponse.json(serializedUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user", details: (error as Error).message }, 
      { status: 500 }
    );
  }
}