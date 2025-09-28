import { MongoClient, Db } from 'mongodb';

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
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!global.mongoClient) {
    const client = new MongoClient(MONGODB_URI!);
    await client.connect();
    global.mongoClient = client;
  }

  cachedClient = global.mongoClient;
  cachedDb = cachedClient.db();

  return { client: cachedClient, db: cachedDb };
}