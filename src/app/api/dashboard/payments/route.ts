import { NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payment';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" }, 
        { status: 400 }
      );
    }

    // Fetch payment history using the payment service
    const payments = await PaymentService.getPaymentHistory(userId, 10);
    
    // Debugging: Log the payments data
    console.log('API Route - Payments data for user', userId, ':', JSON.stringify(payments, null, 2));

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" }, 
      { status: 500 }
    );
  }
}