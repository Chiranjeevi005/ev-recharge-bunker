import { connectToDatabase } from "@/lib/db/connection";
import { ObjectId, Db } from "mongodb";

interface AuditLog {
  _id?: ObjectId;
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  details?: any;
}

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const typedDb = db as Db;

    const logs = await typedDb.collection<AuditLog>("audit_logs").find({}).sort({ timestamp: -1 }).limit(100).toArray();

    // Convert ObjectId to string for JSON serialization
    const serializedLogs = logs.map(log => ({
      ...log,
      id: log._id?.toString(),
      _id: undefined
    }));

    return new Response(
      JSON.stringify(serializedLogs),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching audit logs");
    return new Response(
      JSON.stringify({ error: "Failed to fetch audit logs" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId, action, resource, details } = await request.json();

    if (!userId || !action || !resource) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { db } = await connectToDatabase();
    const typedDb = db as Db;

    const newLog: AuditLog = {
      userId,
      action,
      resource,
      timestamp: new Date(),
      details
    };

    const result = await typedDb.collection<AuditLog>("audit_logs").insertOne(newLog);

    return new Response(
      JSON.stringify({ success: true, id: result.insertedId.toString() }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating audit log");
    return new Response(
      JSON.stringify({ error: "Failed to create audit log" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}