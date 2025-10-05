import { NextResponse } from 'next/server';
import { updateDashboardStats } from '@/lib/realtime/updateStats';

export async function GET() {
  try {
    const stats = await updateDashboardStats();
    return NextResponse.json({ 
      message: 'Stats updated successfully', 
      stats 
    });
  } catch (error: any) {
    console.error('Error updating stats:', error);
    return NextResponse.json(
      { error: 'Failed to update stats', details: error.message }, 
      { status: 500 }
    );
  }
}