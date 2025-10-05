import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Define protected routes and their required roles
const protectedRoutes = [
  {
    path: "/dashboard/admin",
    role: "admin",
  },
  {
    path: "/dashboard",
    role: "client",
  },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is protected
  const protectedRoute = protectedRoutes.find(route => 
    pathname.startsWith(route.path)
  );
  
  if (protectedRoute) {
    // Get the session
    const session = await auth();
    
    // If no session, redirect to login
    if (!session || !session.user) {
      const url = new URL("/login", request.url);
      return NextResponse.redirect(url);
    }
    
    // Check if user has the required role
    if (session.user.role !== protectedRoute.role) {
      // Redirect to appropriate dashboard based on role
      const redirectPath = session.user.role === "admin" 
        ? "/dashboard/admin" 
        : "/dashboard";
      
      const url = new URL(redirectPath, request.url);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    "/dashboard/:path*",
  ],
};