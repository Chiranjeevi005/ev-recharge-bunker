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
    const locationParam = searchParams.get('location');

    console.log('Stations API: Received request for userId:', userId, 'locationParam:', locationParam);

    // Determine the city to search for
    let cityToSearch = "Delhi"; // Default
    
    if (locationParam) {
      // Use the location parameter directly if provided
      cityToSearch = CITY_NAME_MAPPING[locationParam] || locationParam;
      console.log('Stations API: Using location parameter:', locationParam, 'mapped to:', cityToSearch);
    } else if (userId) {
      // If no location parameter, but we have a userId, fetch client's location
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

      if (client && client['location']) {
        const rawCity = client['location'];
        cityToSearch = CITY_NAME_MAPPING[rawCity] || rawCity;
        console.log('Stations API: Using client location:', rawCity, 'mapped to:', cityToSearch);
      }
    }

    console.log('Stations API: Looking for stations in city:', cityToSearch);
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Fetch stations for the determined city
    const stations = await db.collection("stations").find({ 
      city: cityToSearch 
    }).toArray();

    console.log('Stations API: Found stations:', stations);

    // Convert ObjectId to string for JSON serialization and ensure correct data structure
    const serializedStations = stations
      .filter((station: any) => {
        // More robust validation for coordinates
        const lat = station['lat'];
        const lng = station['lng'];
        
        // Check if coordinates exist and are valid numbers
        if (lat === null || lat === undefined || lng === null || lng === undefined) {
          return false;
        }
        
        // Check if they are numbers
        if (typeof lat !== 'number' || typeof lng !== 'number') {
          return false;
        }
        
        // Check if they are finite numbers
        if (!isFinite(lat) || !isFinite(lng)) {
          return false;
        }
        
        // Check coordinate ranges
        if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
          return false;
        }
        
        return true;
      })
      .map((station: any) => ({
        _id: station['_id'].toString(),
        name: station['name'] || 'Unknown Station',
        address: station['address'] || 'Unknown Location',
        lat: station['lat'],
        lng: station['lng'],
        city: station['city'],
        slots: station['slots'] || []
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
        _id: '1',
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
        _id: '2',
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