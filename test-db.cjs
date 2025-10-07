const { connectToDatabase } = require('./src/lib/db/connection.js');
// Load environment variables
require('dotenv').config();

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    const { db } = await connectToDatabase();
    
    console.log('Connected to database:', db.databaseName);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Check if stations collection exists and has data
    const stationsCount = await db.collection("stations").countDocuments();
    console.log('Stations count:', stationsCount);
    
    if (stationsCount > 0) {
      const sampleStations = await db.collection("stations").find().limit(5).toArray();
      console.log('Sample stations:', JSON.stringify(sampleStations, null, 2));
    }
    
    // Check other collections
    const clientsCount = await db.collection("clients").countDocuments();
    console.log('Clients count:', clientsCount);
    
    const paymentsCount = await db.collection("payments").countDocuments();
    console.log('Payments count:', paymentsCount);
    
    console.log('Database test completed successfully!');
  } catch (error) {
    console.error('Database test failed:', error);
  }
}

testDatabase().then(() => {
  console.log("Test completed");
  process.exit(0);
}).catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});