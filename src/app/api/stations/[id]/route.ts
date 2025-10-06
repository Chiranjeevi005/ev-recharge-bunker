import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId, Db } from 'mongodb';

interface Slot {
  slotId: string;
  status: "available" | "occupied" | "maintenance";
  chargerType: string;
  pricePerHour: number;
}

interface Station {
  _id: ObjectId | string;
  city: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  slots: Slot[];
  createdAt?: Date;
  updatedAt?: Date;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { db } = await connectToDatabase();
    const typedDb = db as Db;
    const resolvedParams = await params;
    
    let station = null;
    
    // Try to find by ObjectId first
    if (ObjectId.isValid(resolvedParams.id)) {
      station = await typedDb.collection<Station>("stations").findOne({ 
        _id: new ObjectId(resolvedParams.id) 
      });
    }
    
    // If not found and it's not a valid ObjectId, try as string
    if (!station) {
      station = await typedDb.collection<Station>("stations").findOne({ 
        _id: resolvedParams.id 
      });
    }
    
    if (!station) {
      return NextResponse.json(
        { error: "Station not found" }, 
        { status: 404 }
      );
    }
    
    // Convert to serializable format
    const serializedStation = {
      ...station,
      _id: station._id instanceof ObjectId ? station._id.toString() : station._id,
    };
    
    return NextResponse.json(serializedStation);
  } catch (error) {
    console.error("Error fetching station:", error);
    return NextResponse.json(
      { error: "Failed to fetch station" }, 
      { status: 500 }
    );
  }
}