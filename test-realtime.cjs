const { MongoClient } = require('mongodb');

async function testRealTimeUpdates() {
  // Connect to MongoDB
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/ev-bunker');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Insert a test client
    const testClient = {
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      status: 'active',
      createdAt: new Date()
    };
    
    const result = await db.collection('clients').insertOne(testClient);
    console.log('Inserted test client:', result.insertedId);
    
    // Wait a bit for the change stream to process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update the client
    await db.collection('clients').updateOne(
      { _id: result.insertedId },
      { $set: { lastLogin: new Date() } }
    );
    console.log('Updated test client');
    
    // Wait a bit for the change stream to process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Delete the client
    await db.collection('clients').deleteOne({ _id: result.insertedId });
    console.log('Deleted test client');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

testRealTimeUpdates();