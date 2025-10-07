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

    // Find admin user in the database
    const adminUser = await typedDb.collection("admins").findOne({ email });

    if (!adminUser) {
      return new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, adminUser['password']);
    
    if (!passwordMatch) {
      return new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Return success response in the format that NextAuth expects
    return new Response(
      JSON.stringify({ 
        id: adminUser['_id'].toString(),
        email: adminUser['email'],
        role: 'admin',
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    // Log error internally but don't expose details to client
    console.error("Login error", error);
    return new Response(
      JSON.stringify({ error: "An error occurred during login" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}