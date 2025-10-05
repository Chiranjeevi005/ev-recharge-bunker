import { NextResponse } from "next/server";
import { withAuth, withRole } from "@/lib/api-middleware";
import type { AuthenticatedRequest } from "@/lib/api-middleware";
import { withRateLimit } from "@/lib/rateLimit";

// Example of a rate-limited public endpoint
export const GET = withRateLimit(async (req) => {
  try {
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json({
      message: "This is a rate-limited public endpoint",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error in example endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

// Example of an authenticated endpoint
export const POST = withAuth(withRateLimit(async (req: AuthenticatedRequest) => {
  try {
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json({
      message: "This is an authenticated endpoint",
      user: req.user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error in authenticated endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}));

// Example of an admin-only endpoint
export const PUT = withRole("admin")(withRateLimit(async (req: AuthenticatedRequest) => {
  try {
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json({
      message: "This is an admin-only endpoint",
      user: req.user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error in admin endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}));