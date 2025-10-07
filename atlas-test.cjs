// Test MongoDB Atlas connection
const { MongoClient } = require('mongodb');

// Use the MongoDB Atlas URI from .env.local
const uri = 'mongodb+srv://chiru:chiru@cluster0.yylyjss.mongodb.net/ev_bunker?retryWrites=true&w=majority&appName=Cluster0';

async function testAtlasConnection() {
  try {
    console.log('Testing MongoDB Atlas connection...');
    console.log('Using MongoDB Atlas URI:', uri.replace(/\/\/.*@/, '//***@')); // Hide credentials
    
    // Create MongoDB client
    const client = new MongoClient(uri);
    
    // Connect to database with timeout
    console.log('Connecting to MongoDB Atlas...');
    const connectionPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000);
    });
    
    await Promise.race([connectionPromise, timeoutPromise]);
    console.log('Connected to MongoDB Atlas successfully');
    
    // Get database name
    const db = client.db();
    console.log('Database name:', db.databaseName);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Check if stations collection exists and has data
    const stationsCount = await db.collection("stations").countDocuments();
    console.log('Stations count:', stationsCount);
    
    if (stationsCount > 0) {
      const sampleStations = await db.collection("stations").find().limit(5).toArray();
      console.log('Sample stations count:', sampleStations.length);
    }
    
    // Close connection
    await client.close();
    console.log('MongoDB Atlas test completed successfully!');
  } catch (error) {
    console.error('MongoDB Atlas test failed:', error.message);
  }
}

testAtlasConnection().then(() => {
  console.log("Atlas test completed");
  process.exit(0);
}).catch((error) => {
  console.error("Atlas test failed:", error);
  process.exit(1);
});