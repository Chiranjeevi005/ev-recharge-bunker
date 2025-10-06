import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { ObjectId } from 'mongodb';
import { validateClient } from '@/lib/db/schemas/validation';
import redis from '@/lib/realtime/redis';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const role = searchParams.get('role');
    
    // Create cache key based on parameters
    const cacheKey = `clients:${page}:${limit}:${status || 'all'}:${role || 'all'}`;
    
    // Try to get data from Redis cache first
    if (redis.isAvailable()) {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log('Returning cached clients data');
        return NextResponse.json(JSON.parse(cachedData));
      }
    }
    
    const { db } = await connectToDatabase();
    
    // Build filter query
    const filter: any = {};
    if (status) filter.status = status;
    if (role) filter.role = role;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch clients with pagination and sort by creation date (newest first)
    const clients = await db.collection("clients")
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .toArray();
    
    // Get total count for pagination
    const total = await db.collection("clients").countDocuments(filter);
    
    // Convert ObjectId to string for JSON serialization
    const serializedClients = clients.map((client: any) => ({
      ...client,
      _id: client._id.toString(),
      createdAt: client.createdAt?.toISOString ? client.createdAt.toISOString() : client.createdAt,
      updatedAt: client.updatedAt?.toISOString ? client.updatedAt.toISOString() : client.updatedAt,
      lastLogin: client.lastLogin?.toISOString ? client.lastLogin.toISOString() : client.lastLogin
    }));
    
    const response = {
      success: true,
      data: serializedClients,
      pagination: {
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
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate client data
    if (!validateClient(body)) {
      return NextResponse.json(
        { error: "Invalid client data" },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Check if client with email already exists
    const existingClient = await db.collection("clients").findOne({ 
      email: body.email 
    });
    
    if (existingClient) {
      return NextResponse.json(
        { error: "Client with this email already exists" },
        { status: 409 }
      );
    }
    
    // Insert new client
    // Create a clean object without _id
    const { _id, ...clientData } = body;
    
    const result: any = await db.collection("clients").insertOne({
      ...clientData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Publish update to Redis for real-time sync
    if (redis.isAvailable()) {
      const clientData = {
        event: 'client_update',
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
      
      await redis.publish('client_activity_channel', JSON.stringify(clientData));
    }
    
    return NextResponse.json({ 
      success: true, 
      id: result.insertedId.toString() 
    });
  } catch (error: any) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
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
        { error: "Invalid client ID" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Validate client data
    if (!validateClient(body)) {
      return NextResponse.json(
        { error: "Invalid client data" },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Update client
    const result: any = await db.collection("clients").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...body,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
    
    if (!result || !result.ok) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }
    
    // Publish update to Redis for real-time sync
    if (redis.isAvailable()) {
      const clientData = {
        event: 'client_update',
        operationType: 'update',
        documentKey: id,
        fullDocument: {
          ...result['value'],
          _id: id,
          updatedAt: new Date()
        },
        timestamp: new Date().toISOString()
      };
      
      await redis.publish('client_activity_channel', JSON.stringify(clientData));
    }
    
    return NextResponse.json({ 
      success: true, 
      data: {
        ...result['value'],
        _id: id
      }
    });
  } catch (error: any) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Failed to update client" },
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
        { error: "Invalid client ID" },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Delete client
    const result = await db.collection("clients").deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }
    
    // Publish update to Redis for real-time sync
    if (redis.isAvailable()) {
      const clientData = {
        event: 'client_update',
        operationType: 'delete',
        documentKey: id,
        timestamp: new Date().toISOString()
      };
      
      await redis.publish('client_activity_channel', JSON.stringify(clientData));
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Client deleted successfully"
    });
  } catch (error: any) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}