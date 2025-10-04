import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';

export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase();
    
    // Get total users count
    const totalUsers = await db.collection("clients").countDocuments();
    
    // Get active stations count
    const activeStations = await db.collection("stations").countDocuments({ 
      status: "active" 
    });
    
    // Get active sessions count
    const activeSessions = await db.collection("sessions").countDocuments({ 
      status: "active" 
    });
    
    // Get total revenue from completed payments
    const payments = await db.collection("payments").find({ 
      status: "completed" 
    }).toArray();
    
    const totalRevenue = payments.reduce((sum, payment) => sum + (payment['amount'] || 0), 0);
    
    // Calculate changes (simplified - in a real app, you'd compare with previous period)
    const stats = [
      {
        id: '1',
        name: 'Total Users',
        value: totalUsers,
        change: 0, // Would calculate based on previous period in real implementation
        color: 'from-[#8B5CF6] to-[#10B981]',
        icon: 'user-group'
      },
      {
        id: '2',
        name: 'Active Stations',
        value: activeStations,
        change: 0,
        color: 'from-[#10B981] to-[#059669]',
        icon: 'lightning-bolt'
      },
      {
        id: '3',
        name: 'Active Sessions',
        value: activeSessions,
        change: 0,
        color: 'from-[#F59E0B] to-[#D97706]',
        icon: 'clock'
      },
      {
        id: '4',
        name: 'Revenue',
        value: totalRevenue,
        change: 0,
        color: 'from-[#EF4444] to-[#DC2626]',
        icon: 'currency-rupee'
      }
    ];

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to fetch dashboard stats";
    if (error.message && error.message.includes('Authentication failed')) {
      errorMessage = "Database authentication failed. Please check your MongoDB credentials.";
    } else if (error.message && error.message.includes('connect ECONNREFUSED')) {
      errorMessage = "Database connection refused. Please check if your MongoDB server is running.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    );
  }
}