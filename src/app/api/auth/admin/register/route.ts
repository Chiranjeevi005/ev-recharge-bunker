import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();

    // Check if admin already exists
    const existingAdmin = await db.collection("admins").findOne({ email });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin
    const result = await db.collection("admins").insertOne({
      email,
      hashedPassword,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const admin = await db.collection("admins").findOne({ _id: result.insertedId });

    if (!admin) {
      return NextResponse.json(
        { error: "Failed to create admin user" },
        { status: 500 }
      );
    }

    // Return success response without password
    const { hashedPassword: _, ...adminWithoutPassword } = admin as any;
    
    return NextResponse.json({
      message: "Admin created successfully",
      admin: {
        ...adminWithoutPassword,
        id: admin._id.toString()
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}