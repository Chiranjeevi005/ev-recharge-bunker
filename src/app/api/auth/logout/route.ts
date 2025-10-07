import { cookies } from "next/headers";

export async function POST() {
  try {
    // Clear the refresh token cookie
    (await cookies()).set({
      name: "refreshToken",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Logout error");
    return new Response(
      JSON.stringify({ error: "An error occurred during logout" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}