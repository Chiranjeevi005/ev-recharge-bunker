import { MongoClient, Db } from 'mongodb';
// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

declare global {
  var mongoClient: MongoClient | undefined;
}

const MONGODB_URI = process.env['DATABASE_URL'];

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

  try {
    if (!global.mongoClient) {
      console.log('Creating new MongoDB client');
      const client = new MongoClient(MONGODB_URI!, {
        serverSelectionTimeoutMS: 5000, // 5 second timeout for server selection
        connectTimeoutMS: 5000, // 5 second timeout for connection
        socketTimeoutMS: 10000, // 10 second timeout for socket operations
        maxIdleTimeMS: 30000, // 30 second max idle time
        retryWrites: true,
        retryReads: true
      });
      
      // Add timeout to connection
      const connectPromise = client.connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('MongoDB connection timeout')), 8000)
      );
      
      await Promise.race([connectPromise, timeoutPromise]);
      console.log('Connected to MongoDB');
      global.mongoClient = client;
    } else {
      console.log('Using existing global MongoDB client');
    }

    cachedClient = global.mongoClient;
    // Explicitly specify the database name
    cachedDb = cachedClient.db('ev_bunker');
    console.log('Database name:', cachedDb.databaseName);
    
    // Test the connection by listing collections with timeout
    try {
      const collectionsPromise = cachedDb.listCollections().toArray();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Collections list timeout')), 3000)
      );
      
      const collections = await Promise.race([collectionsPromise, timeoutPromise]) as any[];
      console.log('Available collections:', collections.map(c => c.name));
    } catch (collectionError) {
      console.error('Error listing collections:', collectionError);
    }

    return { client: cachedClient, db: cachedDb };
  } catch (error: any) {
    console.error('Error connecting to database:', error);
    
    // Provide more specific error messages
    if (error.name === 'MongoServerError' && error.code === 8000) {
      throw new Error('Authentication failed. Please check your MongoDB credentials in .env.local');
    } else if (error.name === 'MongoNetworkError') {
      throw new Error('Network error. Please check your MongoDB connection');
    } else if (error.message && error.message.includes('timeout')) {
      throw new Error('Database connection timeout. Please check your MongoDB server status and network connection.');
    } else {
      throw new Error(`Failed to connect to database: ${error.message}`);
    }
  }
}