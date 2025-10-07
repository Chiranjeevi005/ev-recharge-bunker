import { connectToDatabase } from "@/lib/db/connection";
import { ObjectId, Db } from "mongodb";

interface Booking {
  _id?: ObjectId;
  userId: string;
  stationId: string;
  slotId: string;
  startTime: Date;
  endTime?: Date;
  status: "active" | "completed" | "cancelled";
  cost?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const typedDb = db as Db;

    const bookings = await typedDb.collection<Booking>("bookings").find({}).toArray();

    // Convert ObjectId to string for JSON serialization
    const serializedBookings = bookings.map(booking => ({
      ...booking,
      id: booking._id?.toString(),
      _id: undefined
    }));

    return new Response(
      JSON.stringify(serializedBookings),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching bookings");
    return new Response(
      JSON.stringify({ error: "Failed to fetch bookings" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId, stationId, slotId, startTime } = await request.json();

    if (!userId || !stationId || !slotId || !startTime) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { db } = await connectToDatabase();
    const typedDb = db as Db;

    const newBooking: Booking = {
      userId,
      stationId,
      slotId,
      startTime: new Date(startTime),
      status: "active",
      createdAt: new Date(),
    };

    const result = await typedDb.collection<Booking>("bookings").insertOne(newBooking);

    const createdBooking = {
      ...newBooking,
      id: result.insertedId.toString(),
      _id: undefined
    };

    return new Response(
      JSON.stringify(createdBooking),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating booking");
    return new Response(
      JSON.stringify({ error: "Failed to create booking" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { bookingId, ...updateData } = await request.json();

    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: "Booking ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { db } = await connectToDatabase();
    const typedDb = db as Db;

    // Validate ObjectId
    if (!ObjectId.isValid(bookingId)) {
      return new Response(
        JSON.stringify({ error: "Invalid booking ID" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await typedDb.collection<Booking>("bookings").updateOne(
      { _id: new ObjectId(bookingId) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, modifiedCount: result.modifiedCount }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating booking");
    return new Response(
      JSON.stringify({ error: "Failed to update booking" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}