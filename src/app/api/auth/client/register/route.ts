import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

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

    // Check if client already exists
    const existingClient = await prisma.client.findUnique({
      where: { email }
    });

    if (existingClient) {
      return NextResponse.json(
        { error: "Client with this email already exists" },
        { status: 409 }
      );
    }

    // Create the client with a unique googleId for email/password clients
    const client = await prisma.client.create({
      data: {
        name,
        email,
        googleId: `credentials-${Date.now()}-${Math.floor(Math.random() * 10000)}`, // Unique googleId for email/password client
        role: "client"
      }
    });

    // Create an account record to store the password
    await prisma.account.create({
      data: {
        userId: client.id,
        type: "credentials",
        provider: "credentials",
        providerAccountId: client.id,
        access_token: password // In a real implementation, this should be hashed
      }
    });

    // Return success response (without sensitive data)
    return NextResponse.json({
      message: "Client registered successfully",
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        role: client.role
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("Registration error:", error);
    
    // Handle Prisma unique constraint error
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Client with this email already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}