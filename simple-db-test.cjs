// Simple database test script
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Use the MongoDB URI from environment variables
    const uri = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017';
    console.log('Using MongoDB URI:', uri.replace(/\/\/.*@/, '//***@')); // Hide credentials
    
    // Create MongoDB client
    const client = new MongoClient(uri);
    
    // Connect to database
    await client.connect();
    console.log('Connected to MongoDB successfully');
    
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
    
    // Check other collections
    const clientsCount = await db.collection("clients").countDocuments();
    console.log('Clients count:', clientsCount);
    
    const paymentsCount = await db.collection("payments").countDocuments();
    console.log('Payments count:', paymentsCount);
    
    // Close connection
    await client.close();
    console.log('Database test completed successfully!');
  } catch (error) {
    console.error('Database test failed:', error.message);
  }
}

testDatabase().then(() => {
  console.log("Test completed");
  process.exit(0);
}).catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});