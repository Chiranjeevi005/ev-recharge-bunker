import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error('Please define the DATABASE_URL environment variable');
}

export async function connectToDatabaseForAPI() {
  console.log('Creating new MongoDB client for API');
  const client = new MongoClient(MONGODB_URI!);
  await client.connect();
  console.log('Connected to MongoDB for API');
  
  // Explicitly specify the database name
  const db = client.db('ev_bunker');
  console.log('Database name:', db.databaseName);
  
  // List all collections
  const collections = await db.listCollections().toArray();
  console.log('Available collections:', collections.map(c => c.name));
  
  return { client, db };
}