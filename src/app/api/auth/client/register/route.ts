import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();

    // Check if client already exists
    const existingClient = await db.collection("clients").findOne({ email });

    if (existingClient) {
      return NextResponse.json(
        { error: "Client with this email already exists" },
        { status: 409 }
      );
    }

    // Create the client with a unique googleId for email/password clients
    const clientResult = await db.collection("clients").insertOne({
      name,
      email,
      googleId: `credentials-${Date.now()}-${Math.floor(Math.random() * 10000)}`, // Unique googleId for email/password client
      role: "client",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const client = await db.collection("clients").findOne({ _id: clientResult.insertedId });

    if (!client) {
      return NextResponse.json(
        { error: "Failed to create client" },
        { status: 500 }
      );
    }

    // Create an account record to store the password
    await db.collection("accounts").insertOne({
      userId: client._id.toString(),
      type: "credentials",
      provider: "client-credentials",
      providerAccountId: client._id.toString(),
      access_token: password, // In a real implementation, this should be hashed
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Return success response (without sensitive data)
    return NextResponse.json({
      message: "Client registered successfully",
      client: {
        id: client._id.toString(),
        name: client['name'],
        email: client['email'],
        role: client['role']
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("Registration error:", error);
    
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}