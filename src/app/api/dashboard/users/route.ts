import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase();
    
    // Fetch all users
    const users = await db.collection("clients").find({}).toArray();
    
    // Convert ObjectId to string for JSON serialization and map fields
    const serializedUsers = users.map((user: any) => ({
      id: user._id.toString(),
      name: user.name || 'Unknown User',
      email: user.email || 'No email',
      role: user.role || 'client',
      status: 'active', // Default status
      lastLogin: user.updatedAt ? new Date(user.updatedAt).toISOString() : new Date().toISOString()
    }));

    return NextResponse.json(serializedUsers);
  } catch (error: any) {
    console.error("Error fetching users:", error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to fetch users";
    if (error.message && error.message.includes('Authentication failed')) {
      errorMessage = "Database authentication failed. Please check your MongoDB credentials.";
    } else if (error.message && error.message.includes('connect ECONNREFUSED')) {
      errorMessage = "Database connection refused. Please check if your MongoDB server is running.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    );
  }
}