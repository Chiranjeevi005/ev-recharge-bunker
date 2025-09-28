import { MongoClient, Db } from 'mongodb';
// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

declare global {
  var mongoClient: MongoClient | undefined;
}

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error('Please define the DATABASE_URL environment variable');
}

let cachedClient: MongoClient;
let cachedDb: Db;

export async function connectToDatabase() {
  console.log('Connecting to database with URI:', MONGODB_URI ? 'URI SET' : 'URI NOT SET');
  
  if (cachedClient && cachedDb) {
    console.log('Using cached database connection');
    return { client: cachedClient, db: cachedDb };
  }

  if (!global.mongoClient) {
    console.log('Creating new MongoDB client');
    const client = new MongoClient(MONGODB_URI!);
    await client.connect();
    console.log('Connected to MongoDB');
    global.mongoClient = client;
  } else {
    console.log('Using existing global MongoDB client');
  }

  cachedClient = global.mongoClient;
  // Explicitly specify the database name
  cachedDb = cachedClient.db('ev_bunker');
  console.log('Database name:', cachedDb.databaseName);

  return { client: cachedClient, db: cachedDb };
}