import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { validateAuditLog } from '@/lib/db/schemas/validation';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const resource = searchParams.get('resource');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const { db } = await connectToDatabase();
    
    // Build filter query
    const filter: any = {};
    if (userId) filter.userId = userId;
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    
    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch audit logs with pagination
    const auditLogs = await db.collection("audit_logs")
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ timestamp: -1 })
      .toArray();
    
    // Get total count for pagination
    const total = await db.collection("audit_logs").countDocuments(filter);
    
    // Convert ObjectId to string for JSON serialization
    const serializedAuditLogs = auditLogs.map((log: any) => ({
      ...log,
      _id: log._id.toString(),
      userId: log.userId.toString(),
      timestamp: log.timestamp
    }));
    
    return NextResponse.json({
      success: true,
      data: serializedAuditLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate audit log data
    if (!validateAuditLog(body)) {
      return NextResponse.json(
        { error: "Invalid audit log data" },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Insert new audit log
    const { _id, ...auditLogData } = body;
    
    const result = await db.collection("audit_logs").insertOne({
      ...auditLogData,
      timestamp: new Date()
    });
    
    return NextResponse.json({ 
      success: true, 
      id: result.insertedId.toString() 
    });
  } catch (error: any) {
    console.error("Error creating audit log:", error);
    return NextResponse.json(
      { error: "Failed to create audit log" },
      { status: 500 }
    );
  }
}

// Audit logs are typically read-only, so we don't implement PUT or DELETE
// But we'll include them for completeness

export async function PUT(_request: Request) {
  return NextResponse.json(
    { error: "Audit logs are read-only" },
    { status: 405 }
  );
}

export async function DELETE(_request: Request) {
  return NextResponse.json(
    { error: "Audit logs are read-only" },
    { status: 405 }
  );
}