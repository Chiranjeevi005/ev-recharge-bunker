const { MongoClient } = require('mongodb');

async function testClientCount() {
  let mongoClient;
  
  try {
    // Connect to MongoDB - use the same database as the API
    mongoClient = new MongoClient(process.env.DATABASE_URL || 'mongodb://localhost:27017/ev_bunker');
    await mongoClient.connect();
    console.log('Connected to MongoDB');
    
    const db = mongoClient.db();
    
    // Add a test client
    const testClient = {
      name: 'Test Client',
      email: 'test@example.com',
      role: 'user',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('clients').insertOne(testClient);
    console.log('Inserted test client with ID:', result.insertedId.toString());
    
    // Count clients
    const clientCount = await db.collection('clients').countDocuments();
    console.log('Direct client count:', clientCount);
    
    // List all clients
    const clients = await db.collection('clients').find({}).toArray();
    console.log('All clients:', clients);
    
    // Test the dashboard stats API
    console.log('Testing dashboard stats API...');
    const statsResponse = await fetch('http://localhost:3002/api/dashboard/stats');
    const stats = await statsResponse.json();
    console.log('Dashboard stats:', stats);
    
    const userStat = stats.find(stat => stat.id === '1');
    console.log('User stat from API:', userStat);
    
    // Clean up
    await db.collection('clients').deleteOne({ _id: result.insertedId });
    console.log('Deleted test client');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (mongoClient) {
      await mongoClient.close();
      console.log('Disconnected from MongoDB');
    }
  }
}

testClientCount();