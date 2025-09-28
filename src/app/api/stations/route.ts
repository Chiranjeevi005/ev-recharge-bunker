import { NextResponse } from 'next/server';
import { MongoClient, Document } from 'mongodb';
// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

interface Slot {
  slotId: string;
  status: "available" | "occupied" | "maintenance";
  chargerType: string;
  pricePerHour: number;
}

interface Station {
  _id: string; // Changed to string since we'll convert it
  city: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  slots: Slot[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Mock data for when database is not accessible
const mockStations: any[] = [
  {
    _id: "1",
    city: "Delhi",
    name: "Delhi Metro Station",
    address: "Rajiv Chowk, New Delhi",
    lat: 28.6328,
    lng: 77.2194,
    slots: [
      { slotId: "delhi-1-1", status: "available", chargerType: "AC Type 2", pricePerHour: 50 },
      { slotId: "delhi-1-2", status: "available", chargerType: "DC CHAdeMO", pricePerHour: 60 },
      { slotId: "delhi-1-3", status: "occupied", chargerType: "DC CCS", pricePerHour: 70 },
      { slotId: "delhi-1-4", status: "available", chargerType: "AC Type 1", pricePerHour: 45 },
    ]
  },
  {
    _id: "2",
    city: "Mumbai",
    name: "Mumbai Central Station",
    address: "Mumbai Central, Mumbai",
    lat: 18.9693,
    lng: 72.8202,
    slots: [
      { slotId: "mumbai-1-1", status: "available", chargerType: "AC Type 2", pricePerHour: 55 },
      { slotId: "mumbai-1-2", status: "available", chargerType: "DC CCS", pricePerHour: 75 },
      { slotId: "mumbai-1-3", status: "occupied", chargerType: "DC CHAdeMO", pricePerHour: 65 },
    ]
  }
];

export async function GET() {
  let client: MongoClient | null = null;
  
  try {
    console.log('Creating new MongoDB client for stations API');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    client = new MongoClient(process.env.DATABASE_URL!);
    await client.connect();
    console.log('Connected to MongoDB for stations API');
    
    // Explicitly specify the database name
    const db = client.db('ev_bunker');
    console.log('Database name:', db.databaseName);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map((c: any) => c.name));
    
    // Try to fetch stations from the correct collection
    let stations: Document[] = [];
    try {
      console.log('Attempting to fetch from "stations" collection');
      stations = await db.collection("stations").find({}).toArray();
      console.log('Found stations in "stations" collection:', stations.length);
    } catch (collectionError) {
      console.log('Error fetching from "stations" collection:', collectionError);
    }
    
    // If no stations found, try alternative collection names
    if (stations.length === 0) {
      try {
        console.log('Attempting to fetch from "ChargingStation" collection');
        stations = await db.collection("ChargingStation").find({}).toArray();
        console.log('Found stations in "ChargingStation" collection:', stations.length);
      } catch (collectionError) {
        console.log('Error fetching from "ChargingStation" collection:', collectionError);
      }
    }
    
    // Try to directly access the collection to see if it exists
    if (stations.length === 0) {
      try {
        console.log('Checking if "stations" collection exists');
        const collectionInfo = await db.listCollections({name: "stations"}).toArray();
        console.log('"stations" collection info:', collectionInfo);
      } catch (collectionError) {
        console.log('Error checking "stations" collection existence:', collectionError);
      }
    }
    
    if (stations.length === 0) {
      console.log('No stations found, returning mock data');
      return NextResponse.json(mockStations);
    }
    
    // Convert ObjectId to string for JSON serialization
    const serializedStations = stations.map((station: any) => ({
      ...station,
      _id: station._id.toString(),
      slots: station.slots || []
    }));
    
    console.log('Returning', serializedStations.length, 'stations from API');
    return NextResponse.json(serializedStations);
  } catch (error: any) {
    console.error("Error fetching stations:", error);
    console.log('Returning mock data due to error');
    return NextResponse.json(mockStations);
  } finally {
    // Close the connection
    if (client) {
      await client.close();
      console.log('Closed MongoDB connection');
    }
  }
}

export async function POST(request: Request) {
  let client: MongoClient | null = null;
  
  try {
    client = new MongoClient(process.env.DATABASE_URL!);
    await client.connect();
    const db = client.db('ev_bunker');
    
    const body = await request.json();
    
    // Insert new station
    const result = await db.collection("stations").insertOne({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return NextResponse.json({ 
      success: true, 
      id: result.insertedId.toString() 
    });
  } catch (error) {
    console.error("Error creating station:", error);
    return NextResponse.json(
      { error: "Failed to create station" }, 
      { status: 500 }
    );
  } finally {
    // Close the connection
    if (client) {
      await client.close();
    }
  }
}