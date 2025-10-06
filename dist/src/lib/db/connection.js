"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
exports.closeDatabaseConnection = closeDatabaseConnection;
exports.getDatabase = getDatabase;
const mongodb_1 = require("mongodb");
// Default configuration
const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second
const DEFAULT_CONNECTION_TIMEOUT = 5000; // 5 seconds
// MongoDB connection URI from environment variables
const MONGODB_URI = process.env['MONGODB_URI'] || 'mongodb://localhost:27017';
// Global variables to cache the client and connection state
let cachedClient = null;
let cachedDb = null;
/**
 * Simple logger function
 */
function log(message, ...optionalParams) {
    console.log(`[DB Connection] ${message}`, ...optionalParams);
}
/**
 * Creates a MongoDB client with retry logic and timeout configuration
 */
async function connectToDatabase(retries = DEFAULT_RETRY_ATTEMPTS, retryDelay = DEFAULT_RETRY_DELAY) {
    // Return cached connection if available
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }
    const options = {
        serverSelectionTimeoutMS: DEFAULT_CONNECTION_TIMEOUT,
        connectTimeoutMS: DEFAULT_CONNECTION_TIMEOUT,
    };
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            log(`Connecting to MongoDB (attempt ${attempt}/${retries})`);
            const client = new mongodb_1.MongoClient(MONGODB_URI, options);
            await client.connect();
            const db = client.db(); // Use database from URI or default
            // Cache the connection
            cachedClient = client;
            cachedDb = db;
            log('Successfully connected to MongoDB');
            return { client, db };
        }
        catch (error) {
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
async function closeDatabaseConnection() {
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
function getDatabase() {
    if (!cachedDb) {
        throw new Error('Database not connected. Call connectToDatabase first.');
    }
    return cachedDb;
}
