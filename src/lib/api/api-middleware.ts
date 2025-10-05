import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { withRateLimit } from "@/lib/rateLimit";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return withRateLimit(async (req: NextRequest) => {
    try {
      // Get the authorization header
      const authHeader = req.headers.get("authorization");
      
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { error: "Authorization header missing or invalid" },
          { status: 401 }
        );
      }
      
      // Extract the token
      const token = authHeader.substring(7); // Remove "Bearer " prefix
      
      // Verify the token
      const decoded = jwt.verify(token, process.env["AUTH_SECRET"]!) as {
        id: string;
        email: string;
        role: string;
      };
      
      // Add user info to the request
      (req as AuthenticatedRequest).user = decoded;
      
      // Call the handler with the authenticated request
      return handler(req as AuthenticatedRequest);
    } catch (error) {
      console.error("Authentication error:", error);
      return NextResponse.json(
        { error: "Invalid or expired token: " + (error as Error).message },
        { status: 401 }
      );
    }
  });
}

export function withRole(requiredRole: string) {
  return function (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
    return withAuth(async (req: AuthenticatedRequest) => {
      // Check if user has the required role
      if (req.user?.role !== requiredRole) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        );
      }
      
      return handler(req);
    });
  };
}