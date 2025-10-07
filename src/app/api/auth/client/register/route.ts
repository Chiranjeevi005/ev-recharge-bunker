import { connectToDatabase } from "@/lib/db/connection";
import type { Db } from "mongodb";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Name, email, and password are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { db } = await connectToDatabase();
    const typedDb = db as Db;

    // Check if client already exists
    const existingClient = await typedDb.collection("clients").findOne({ email });
    
    if (existingClient) {
      return new Response(
        JSON.stringify({ error: "Client already exists" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create the client with a unique googleId for email/password clients
    const clientResult = await typedDb.collection("clients").insertOne({
      name,
      email,
      googleId: `credentials-${Date.now()}-${Math.floor(Math.random() * 10000)}`, // Unique googleId for email/password client
      role: "client",
      createdAt: new Date(),
    });

    // Create an account record to store the password
    await typedDb.collection("accounts").insertOne({
      userId: clientResult.insertedId.toString(),
      provider: "client-credentials",
      providerAccountId: clientResult.insertedId.toString(),
      access_token: password, // In a real implementation, this should be hashed
      token_type: "password",
      scope: "email",
      createdAt: new Date(),
    });

    // Return success response without password
    return new Response(
      JSON.stringify({ 
        success: true, 
        client: {
          id: clientResult.insertedId,
          name,
          email
        }
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Registration error");
    return new Response(
      JSON.stringify({ error: "An error occurred during registration" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}