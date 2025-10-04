import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';

// City name mapping from dropdown values to database values
const CITY_NAME_MAPPING: Record<string, string> = {
  "Bangalore": "Bengaluru",
  "Hyderabad": "Hyderabad",
  "Chennai": "Chennai",
  "Delhi": "Delhi",
  "Mumbai": "Mumbai",
  "Kolkata": "Kolkata",
  "Pune": "Pune",
  "Ahmedabad": "Ahmedabad"
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('Stations API: Received request for userId:', userId);

    if (!userId) {
      console.log('Stations API: No userId provided, returning default stations');
      // Return default stations for Delhi
      const defaultStations = [
        {
          id: '1',
          name: 'Delhi Metro Station',
          address: 'Central Delhi, Delhi',
          lat: 28.6328,
          lng: 77.2194,
          city: 'Delhi',
          slots: [
            { slotId: '1', status: 'available', chargerType: 'AC Type 2', pricePerHour: 50 },
            { slotId: '2', status: 'available', chargerType: 'DC CCS', pricePerHour: 70 },
            { slotId: '3', status: 'occupied', chargerType: 'DC CHAdeMO', pricePerHour: 60 },
          ]
        },
        {
          id: '2',
          name: 'Delhi Central Hub',
          address: 'Downtown Delhi, Delhi',
          lat: 28.6139,
          lng: 77.2090,
          city: 'Delhi',
          slots: [
            { slotId: '1', status: 'available', chargerType: 'AC Type 1', pricePerHour: 45 },
            { slotId: '2', status: 'available', chargerType: 'DC CCS', pricePerHour: 75 },
            { slotId: '3', status: 'maintenance', chargerType: 'AC Type 2', pricePerHour: 50 },
          ]
        }
      ];
      return NextResponse.json(defaultStations);
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(userId)) {
      console.log('Stations API: Invalid userId format');
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Fetch client to get their location
    const client = await db.collection("clients").findOne({ 
      _id: new ObjectId(userId) 
    });
    
    console.log('Stations API: Found client:', client);

    if (!client) {
      console.log('Stations API: Client not found, returning default stations');
      // Return default stations for Delhi
      const defaultStations = [
        {
          id: '1',
          name: 'Delhi Metro Station',
          address: 'Central Delhi, Delhi',
          lat: 28.6328,
          lng: 77.2194,
          city: 'Delhi',
          slots: [
            { slotId: '1', status: 'available', chargerType: 'AC Type 2', pricePerHour: 50 },
            { slotId: '2', status: 'available', chargerType: 'DC CCS', pricePerHour: 70 },
            { slotId: '3', status: 'occupied', chargerType: 'DC CHAdeMO', pricePerHour: 60 },
          ]
        },
        {
          id: '2',
          name: 'Delhi Central Hub',
          address: 'Downtown Delhi, Delhi',
          lat: 28.6139,
          lng: 77.2090,
          city: 'Delhi',
          slots: [
            { slotId: '1', status: 'available', chargerType: 'AC Type 1', pricePerHour: 45 },
            { slotId: '2', status: 'available', chargerType: 'DC CCS', pricePerHour: 75 },
            { slotId: '3', status: 'maintenance', chargerType: 'AC Type 2', pricePerHour: 50 },
          ]
        }
      ];
      return NextResponse.json(defaultStations);
    }
    
    // Use client's location or default to Delhi
    // Apply mapping if needed
    const rawCity = client['location'] || "Delhi";
    const city = CITY_NAME_MAPPING[rawCity] || rawCity;
    
    console.log('Stations API: Looking for stations in city:', city, 'rawCity:', rawCity);
    
    // Fetch stations for the client's city
    const stations = await db.collection("stations").find({ 
      city: city 
    }).toArray();

    console.log('Stations API: Found stations:', stations);

    // Convert ObjectId to string for JSON serialization and filter invalid stations
    const serializedStations = stations
      .filter((station: any) => 
        station['lat'] !== null && 
        station['lat'] !== undefined && 
        typeof station['lat'] === 'number' &&
        station['lng'] !== null && 
        station['lng'] !== undefined && 
        typeof station['lng'] === 'number'
      )
      .map((station: any) => ({
        id: station['_id'].toString(),
        name: station['name'] || 'Unknown Station',
        location: station['address'] || 'Unknown Location',
        status: station['status'] || 'active',
        slots: station['slots'] ? station['slots'].length : 0,
        available: station['slots'] ? station['slots'].filter((slot: any) => slot.status === 'available').length : 0
      }));

    console.log('Stations API: Returning serialized stations:', serializedStations);
    return NextResponse.json(serializedStations);
  } catch (error: any) {
    console.error("Error fetching stations:", error);
    
    // Provide more specific error messages
    if (error.message && error.message.includes('Authentication failed')) {
      console.error("Database authentication failed. Please check your MongoDB credentials.");
    } else if (error.message && error.message.includes('connect ECONNREFUSED')) {
      console.error("Database connection refused. Please check if your MongoDB server is running.");
    }
    
    // Return default stations for Delhi in case of error
    const defaultStations = [
      {
        id: '1',
        name: 'Delhi Metro Station',
        address: 'Central Delhi, Delhi',
        lat: 28.6328,
        lng: 77.2194,
        city: 'Delhi',
        slots: [
          { slotId: '1', status: 'available', chargerType: 'AC Type 2', pricePerHour: 50 },
          { slotId: '2', status: 'available', chargerType: 'DC CCS', pricePerHour: 70 },
          { slotId: '3', status: 'occupied', chargerType: 'DC CHAdeMO', pricePerHour: 60 },
        ]
      },
      {
        id: '2',
        name: 'Delhi Central Hub',
        address: 'Downtown Delhi, Delhi',
        lat: 28.6139,
        lng: 77.2090,
        city: 'Delhi',
        slots: [
          { slotId: '1', status: 'available', chargerType: 'AC Type 1', pricePerHour: 45 },
          { slotId: '2', status: 'available', chargerType: 'DC CCS', pricePerHour: 75 },
          { slotId: '3', status: 'maintenance', chargerType: 'AC Type 2', pricePerHour: 50 },
        ]
      }
    ];
    return NextResponse.json(defaultStations);
  }
}