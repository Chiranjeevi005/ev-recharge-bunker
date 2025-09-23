import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { signIn } from "@/lib/auth";

const prisma = new PrismaClient();

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

    // Check if credentials match the single admin account
    const isAdmin = email === "admin@ebunker.com" && password === "admin123";

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if admin user exists in database, create if not
    let admin = await prisma.admin.findUnique({
      where: { email: "admin@ebunker.com" }
    });

    if (!admin) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Create the admin user
      admin = await prisma.admin.create({
        data: {
          email: "admin@ebunker.com",
          hashedPassword,
          role: "admin"
        }
      });
    }

    // For proper session management, we'll return success
    // The frontend will handle the redirect and session creation
    return NextResponse.json({
      message: "Login successful",
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}