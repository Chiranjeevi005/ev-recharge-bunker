import { MongoClient, type MongoClientOptions } from 'mongodb';

// Default configuration
const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second
const DEFAULT_CONNECTION_TIMEOUT = 5000; // 5 seconds

// MongoDB connection URI from environment variables
const MONGODB_URI = process.env['MONGODB_URI'] || 'mongodb://localhost:27017';

// Global variables to cache the client and connection state
let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

/**
 * Simple logger function
 */
function log(message: string, ...optionalParams: any[]) {
  console.log(`[DB Connection] ${message}`, ...optionalParams);
}

/**
 * Creates a MongoDB client with retry logic and timeout configuration
 */
export async function connectToDatabase(
  retries: number = DEFAULT_RETRY_ATTEMPTS,
  retryDelay: number = DEFAULT_RETRY_DELAY
): Promise<{ client: MongoClient; db: any }> {
  // Return cached connection if available
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const options: MongoClientOptions = {
    serverSelectionTimeoutMS: DEFAULT_CONNECTION_TIMEOUT,
    connectTimeoutMS: DEFAULT_CONNECTION_TIMEOUT,
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      log(`Connecting to MongoDB (attempt ${attempt}/${retries})`);
      const client = new MongoClient(MONGODB_URI, options);
      await client.connect();
      
      const db = client.db(); // Use database from URI or default
      
      // Cache the connection
      cachedClient = client;
      cachedDb = db;
      
      log('Successfully connected to MongoDB');
      return { client, db };
    } catch (error) {
      log(`MongoDB connection attempt ${attempt} failed:`, error);
      
      // If this is the last attempt, throw the error
      if (attempt === retries) {
        throw new Error(`Failed to connect to MongoDB after ${retries} attempts: ${error}`);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  // This should never be reached, but TypeScript requires it
  throw new Error('Unexpected error in MongoDB connection');
}

/**
 * Closes the MongoDB connection
 */
export async function closeDatabaseConnection(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    log('MongoDB connection closed');
  }
}

/**
 * Gets the current database instance
 */
export function getDatabase() {
  if (!cachedDb) {
    throw new Error('Database not connected. Call connectToDatabase first.');
  }
  return cachedDb;
}