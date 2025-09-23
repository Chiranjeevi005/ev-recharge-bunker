import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    // This will help us see what the auth function returns
    const session = await auth();
    return new Response(JSON.stringify({ session }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}