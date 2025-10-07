// Full test of database and Redis connections
require('dotenv').config({ path: '.env.local' });

const { MongoClient } = require('mongodb');
const { createClient } = require('redis');

async function testConnections() {
  console.log('Testing database and Redis connections...');
  
  // Test MongoDB Atlas
  try {
    const mongoUri = process.env.DATABASE_URL || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.log('MongoDB URI not found in environment variables');
      return;
    }
    
    console.log('Using MongoDB Atlas URI:', mongoUri.replace(/\/\/.*@/, '//***@')); // Hide credentials
    
    const mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    console.log('✅ Connected to MongoDB Atlas successfully');
    
    const db = mongoClient.db();
    console.log('Database name:', db.databaseName);
    
    const stationsCount = await db.collection("stations").countDocuments();
    console.log('Stations count:', stationsCount);
    
    await mongoClient.close();
  } catch (error) {
    console.error('❌ MongoDB test failed:', error.message);
  }
  
  // Test Redis
  try {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      console.log('REDIS_URL not found in environment variables');
      return;
    }
    
    console.log('Using Redis URI:', redisUrl.replace(/:\/\/.*@/, '://***@')); // Hide credentials
    
    const redisClient = createClient({
      url: redisUrl
    });
    
    redisClient.on('error', (err) => {
      console.error('Redis error:', err.message);
    });
    
    await redisClient.connect();
    console.log('✅ Connected to Redis successfully');
    
    // Test Redis operations
    await redisClient.set('ev-bunker-test', 'test-success');
    const value = await redisClient.get('ev-bunker-test');
    console.log('Redis SET/GET test:', value);
    
    await redisClient.quit();
  } catch (error) {
    console.error('❌ Redis test failed:', error.message);
  }
  
  console.log('Connection tests completed!');
}

testConnections().then(() => {
  console.log("All tests completed");
  process.exit(0);
}).catch((error) => {
  console.error("Tests failed:", error);
  process.exit(1);
});