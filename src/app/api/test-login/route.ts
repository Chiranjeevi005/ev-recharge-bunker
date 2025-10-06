import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";

export async function POST(request: Request) {
  try {
    // Parse the request body properly
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    
    const { email, password } = body;
    
    console.log("Login attempt with:", { email, password });

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();

    // Find client by email
    const client = await db.collection("clients").findOne({ email });
    
    console.log("Client found:", client);

    if (!client) {
      console.log("Client not found");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // For email/password clients, check if they have a credentials-type googleId
    // In our implementation, clients with googleId starting with "credentials-" are email/password clients
    if (!(client as any).googleId?.startsWith("credentials-")) {
      console.log("Client is not a credentials-type client");
      // This is a Google OAuth client, they can't use password auth
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // For email/password clients, we'll check the Account record to verify the password
    // First, check if an account already exists for this client
    const existingAccount = await db.collection("accounts").findOne({
      userId: client._id.toString(),
      provider: "credentials"
    });
    
    console.log("Account found:", existingAccount);

    if (!existingAccount) {
      console.log("No account found for client");
      // This shouldn't happen - email/password clients should have an account
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    } else {
      // Check if the provided password matches
      // In a real implementation, you would compare hashed passwords
      if ((existingAccount as any).access_token !== password) {
        console.log("Password mismatch");
        console.log("Expected:", (existingAccount as any).access_token);
        console.log("Provided:", password);
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }
    }

    // Return success response
    console.log("Authentication successful");
    return NextResponse.json({
      message: "Login successful",
      user: {
        id: client._id.toString(),
       user: {
         id: client._id.toString(),
         email: (client as Client).email,
         name: (client as Client).name,
         role: (client as Client).role,
       }      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Login error:", error);
    
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}