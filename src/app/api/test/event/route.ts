import { NextResponse } from 'next/server';

export async function GET() {
  // This is just a test endpoint to verify the server is working
  return NextResponse.json({ 
    message: 'Event test endpoint working',
    timestamp: new Date().toISOString()
  });
}