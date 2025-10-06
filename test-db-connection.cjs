const { MongoClient } = require('mongodb');

async function testDbConnection() {
  try {
    // Test the database connection used by the API
    console.log('Testing database connection used by API...');
    const uri = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/ev-bunker';
    console.log('Using URI:', uri);
    
    const mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    console.log('Connected to MongoDB');
    
    const db = mongoClient.db();
    console.log('Connected to database:', db.databaseName);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Count clients
    const clientCount = await db.collection('clients').countDocuments();
    console.log('Total clients in API database:', clientCount);
    
    // List all clients
    const clients = await db.collection('clients').find({}).toArray();
    console.log('All clients in API database:', clients);
    
    await mongoClient.close();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testDbConnection();