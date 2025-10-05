import { NextRequest, NextResponse } from "next/server";

// In-memory store for rate limiting
// In production, you should use Redis or another external store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per window

export function withRateLimit(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const key = `${ip}:${req.nextUrl.pathname}`;
    
    const now = Date.now();
    const window = rateLimitStore.get(key);
    
    // Reset count if window has expired
    if (window && window.resetTime <= now) {
      rateLimitStore.delete(key);
    }
    
    // Get or create window
    const currentWindow = rateLimitStore.get(key) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
    
    // Check if limit exceeded
    if (currentWindow.count >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }
    
    // Increment count
    currentWindow.count += 1;
    rateLimitStore.set(key, currentWindow);
    
    // Add rate limit headers
    const response = await handler(req);
    response.headers.set("X-RateLimit-Limit", RATE_LIMIT_MAX.toString());
    response.headers.set("X-RateLimit-Remaining", (RATE_LIMIT_MAX - currentWindow.count).toString());
    response.headers.set("X-RateLimit-Reset", Math.ceil(currentWindow.resetTime / 1000).toString());
    
    return response;
  };
}