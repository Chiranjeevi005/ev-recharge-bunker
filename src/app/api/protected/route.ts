import { NextResponse } from "next/server";
import { withAuth, withRole } from "@/lib/api/api-middleware";

// Protected route that requires authentication
export const GET = withAuth(async (req) => {
  return NextResponse.json({
    message: "This is a protected route",
    user: req.user,
  });
});

// Admin-only route
export const POST = withRole("admin")(async (req) => {
  return NextResponse.json({
    message: "This route is only accessible by admins",
    user: req.user,
  });
});