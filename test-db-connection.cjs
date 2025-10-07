const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testConnection() {
  try {
    // Get the MongoDB URI from environment variables
    const MONGODB_URI = process.env['DATABASE_URL'] || process.env['MONGODB_URI'] || 'mongodb://localhost:27017';
    const DB_NAME = 'ev_bunker'; // Default database name
    
    console.log(`Connecting to MongoDB at ${MONGODB_URI}`);
    
    // Connect to MongoDB
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    // Get the database
    const db = client.db(DB_NAME);
    
    console.log(`Connected to database: ${db.databaseName}`);
    
    // Test retrieving users
    const users = await db.collection("clients").find({}).toArray();
    console.log(`Found ${users.length} users in the database:`);
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });
    
    // Test retrieving stations
    const stations = await db.collection("stations").find({}).toArray();
    console.log(`Found ${stations.length} stations in the database:`);
    stations.forEach(station => {
      console.log(`  - ${station.name} in ${station.city} (${station.slots.length} slots)`);
    });
    
    // Close the connection
    await client.close();
    
    console.log("Database connection test completed successfully!");
  } catch (error) {
    console.error("Error testing database connection:", error);
    process.exit(1);
  }
}

// Run the test function
testConnection().then(() => {
  console.log("Database test completed");
  process.exit(0);
}).catch((error) => {
  console.error("Database test failed:", error);
  process.exit(1);
});