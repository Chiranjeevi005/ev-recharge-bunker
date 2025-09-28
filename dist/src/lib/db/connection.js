"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
const mongodb_1 = require("mongodb");
const MONGODB_URI = process.env.DATABASE_URL;
if (!MONGODB_URI) {
    throw new Error('Please define the DATABASE_URL environment variable');
}
let cachedClient;
let cachedDb;
async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }
    if (!global.mongoClient) {
        const client = new mongodb_1.MongoClient(MONGODB_URI);
        await client.connect();
        global.mongoClient = client;
    }
    cachedClient = global.mongoClient;
    cachedDb = cachedClient.db();
    return { client: cachedClient, db: cachedDb };
}
