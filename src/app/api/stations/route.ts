import { NextResponse } from 'next/server';

// Mock data for charging stations
const chargingStations = [
  {
    id: 1,
    name: 'Delhi Metro Station',
    address: 'Rajiv Chowk, New Delhi',
    phone: '+91 11 2345 6789',
    position: [77.209021, 28.613939],
    slots: 12,
    available: 8,
    pricing: '₹25/min',
    distance: '0.5 km',
    fastCharging: true
  },
  {
    id: 2,
    name: 'Connaught Place Hub',
    address: 'Connaught Place, New Delhi',
    phone: '+91 11 3456 7890',
    position: [77.219400, 28.632800],
    slots: 10,
    available: 5,
    pricing: '₹30/min',
    distance: '1.2 km',
    fastCharging: true
  },
  {
    id: 3,
    name: 'South Delhi Complex',
    address: 'Hauz Khas, New Delhi',
    phone: '+91 11 4567 8901',
    position: [77.211000, 28.589700],
    slots: 15,
    available: 12,
    pricing: '₹20/min',
    distance: '2.3 km',
    fastCharging: false
  },
  {
    id: 4,
    name: 'East Delhi Mall',
    address: 'Welcome Metro Station, Delhi',
    phone: '+91 11 5678 9012',
    position: [77.280000, 28.620000],
    slots: 8,
    available: 3,
    pricing: '₹35/min',
    distance: '3.1 km',
    fastCharging: true
  },
  {
    id: 5,
    name: 'North Delhi Center',
    address: 'Kashmere Gate, Delhi',
    phone: '+91 11 6789 0123',
    position: [77.190000, 28.680000],
    slots: 20,
    available: 15,
    pricing: '₹22/min',
    distance: '4.5 km',
    fastCharging: false
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  
  // If there's a search query, filter stations
  if (query) {
    const filteredStations = chargingStations.filter(station => 
      station.name.toLowerCase().includes(query.toLowerCase()) ||
      station.address.toLowerCase().includes(query.toLowerCase())
    );
    return NextResponse.json(filteredStations);
  }
  
  // Return all stations
  return NextResponse.json(chargingStations);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { stationId, slotId } = body;
    
    // In a real implementation, this would update the database
    // For now, we'll just simulate a successful booking
    const station = chargingStations.find(s => s.id === stationId);
    
    if (!station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }
    
    if (station.available <= 0) {
      return NextResponse.json({ error: 'No slots available' }, { status: 400 });
    }
    
    // Simulate booking by reducing available slots
    // In a real app, this would be a database update
    const updatedStation = {
      ...station,
      available: station.available - 1
    };
    
    return NextResponse.json({
      success: true,
      message: 'Booking confirmed',
      station: updatedStation
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process booking' }, { status: 500 });
  }
}