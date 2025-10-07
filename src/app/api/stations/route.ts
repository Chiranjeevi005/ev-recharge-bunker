import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';
import { validateStation } from '@/lib/db/schemas/validation';
import redis from '@/lib/realtime/redisQueue';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    // Increase default limit to show more stations
    const limit = parseInt(searchParams.get('limit') || '100');
    const status = searchParams.get('status');
    const city = searchParams.get('city');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    
    // Special case: if limit is set to -1, fetch all stations
    const fetchAll = limit === -1;
    
    // Create cache key based on parameters
    const cacheKey = `stations:${page}:${limit}:${status || 'all'}:${city || 'all'}:${sortBy}:${sortOrder}`;
    
    // Try to get data from Redis cache first
    if (redis.isAvailable()) {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log('Returning cached stations data');
        return NextResponse.json(JSON.parse(cachedData));
      }
    }
    
    const { db } = await connectToDatabase();
    
    // Build filter query
    const filter: any = {};
    if (status) filter.status = status;
    if (city) filter.city = city;
    
    // Validate sortBy field to prevent injection
    const validSortFields = ['createdAt', 'name', 'city'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    
    let stations, total;
    
    // Use projection to only fetch required fields
    const projection = {
      name: 1,
      address: 1,
      city: 1,
      state: 1,
      country: 1,
      postalCode: 1,
      location: 1,
      status: 1,
      totalSlots: 1,
      availableSlots: 1,
      "slots.slotId": 1,
      "slots.status": 1,
      createdAt: 1,
      updatedAt: 1
    };
    
    if (fetchAll) {
      // Fetch all stations without pagination
      stations = await db.collection("stations")
        .find(filter)
        .project(projection)
        .sort({ [sortField]: sortOrder })
        .toArray();
      
      total = stations.length;
    } else {
      // Calculate pagination
      const skip = (page - 1) * limit;
      
      // Fetch stations with pagination, sorting, and projection for better performance
      stations = await db.collection("stations")
        .find(filter)
        .project(projection)
        .skip(skip)
        .limit(limit)
        .sort({ [sortField]: sortOrder })
        .toArray();
      
      // Get total count for pagination using estimatedDocumentCount for better performance when no filters
      total = Object.keys(filter).length === 0 
        ? await db.collection("stations").estimatedDocumentCount()
        : await db.collection("stations").countDocuments(filter);
    }
    
    // Convert ObjectId to string for JSON serialization
    const serializedStations = stations.map((station: any) => ({
      ...station,
      _id: station._id.toString(),
      createdAt: station.createdAt,
      updatedAt: station.updatedAt
    }));
    
    const response = {
      success: true,
      data: serializedStations,
      pagination: fetchAll ? null : {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
    
    // Cache the response for 60 seconds
    if (redis.isAvailable()) {
      await redis.setex(cacheKey, 60, JSON.stringify(response));
    }
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error fetching stations:", error);
    return NextResponse.json(
      { error: "Failed to fetch stations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate station data
    if (!validateStation(body)) {
      return NextResponse.json(
        { error: "Invalid station data" },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Insert new station
    const { _id, ...stationData } = body;
    
    const result: any = await db.collection("stations").insertOne({
      ...stationData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Publish update to Redis for real-time sync
    if (redis.isAvailable()) {
      const stationData = {
        event: 'station_update',
        operationType: 'insert',
        documentKey: result.insertedId.toString(),
        fullDocument: {
          ...body,
          _id: result.insertedId.toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        timestamp: new Date().toISOString()
      };
      
      await redis.enqueueMessage('client_activity_channel', JSON.stringify(stationData));
    }
    
    return NextResponse.json({ 
      success: true, 
      id: result.insertedId.toString() 
    });
  } catch (error: any) {
    console.error("Error creating station:", error);
    return NextResponse.json(
      { error: "Failed to create station" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid station ID" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Validate station data
    if (!validateStation(body)) {
      return NextResponse.json(
        { error: "Invalid station data" },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Update station using findOneAndUpdate with projection for efficiency
    const result: any = await db.collection("stations").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...body,
          updatedAt: new Date()
        }
      },
      { 
        returnDocument: 'after',
        projection: { 
          name: 1,
          address: 1,
          city: 1,
          state: 1,
          country: 1,
          postalCode: 1,
          location: 1,
          status: 1,
          totalSlots: 1,
          availableSlots: 1,
          "slots.slotId": 1,
          "slots.status": 1,
          createdAt: 1,
          updatedAt: 1
        } 
      }
    );
    
    if (!result || !result.ok) {
      return NextResponse.json(
        { error: "Station not found" },
        { status: 404 }
      );
    }
    
    // Publish update to Redis for real-time sync
    if (redis.isAvailable()) {
      const stationData = {
        event: 'station_update',
        operationType: 'update',
        documentKey: id,
        fullDocument: {
          ...result.value,
          _id: id,
          updatedAt: new Date()
        },
        timestamp: new Date().toISOString()
      };
      
      await redis.enqueueMessage('client_activity_channel', JSON.stringify(stationData));
    }
    
    return NextResponse.json({ 
      success: true, 
      data: {
        ...result.value,
        _id: id
      }
    });
  } catch (error: any) {
    console.error("Error updating station:", error);
    return NextResponse.json(
      { error: "Failed to update station" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid station ID" },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Delete station
    const result = await db.collection("stations").deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Station not found" },
        { status: 404 }
      );
    }
    
    // Publish update to Redis for real-time sync
    if (redis.isAvailable()) {
      const stationData = {
        event: 'station_update',
        operationType: 'delete',
        documentKey: id,
        timestamp: new Date().toISOString()
      };
      
      await redis.enqueueMessage('client_activity_channel', JSON.stringify(stationData));
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Station deleted successfully"
    });
  } catch (error: any) {
    console.error("Error deleting station:", error);
    return NextResponse.json(
      { error: "Failed to delete station" },
      { status: 500 }
    );
  }
}