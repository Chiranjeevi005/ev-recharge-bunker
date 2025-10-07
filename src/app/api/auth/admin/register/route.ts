import { connectToDatabase } from "@/lib/db/connection";
import bcrypt from "bcryptjs";
import type { Db } from "mongodb";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { db } = await connectToDatabase();
    const typedDb = db as Db;

    // Check if admin already exists
    const existingAdmin = await typedDb.collection("admins").findOne({ email });
    
    if (existingAdmin) {
      return new Response(
        JSON.stringify({ error: "Admin already exists" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const result = await typedDb.collection("admins").insertOne({
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    // Return success response without password
    return new Response(
      JSON.stringify({ 
        success: true, 
        admin: {
          id: result.insertedId,
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