const { MongoClient, ObjectId } = require('mongodb');

async function testRealTimeUpdate() {
  let mongoClient;
  
  try {
    // Connect to MongoDB
    mongoClient = new MongoClient(process.env.DATABASE_URL || 'mongodb://localhost:27017/ev-bunker');
    await mongoClient.connect();
    console.log('Connected to MongoDB');
    
    const db = mongoClient.db();
    
    // Get initial stats
    console.log('Getting initial stats...');
    const initialStatsResponse = await fetch('http://localhost:3002/api/dashboard/stats');
    const initialStats = await initialStatsResponse.json();
    console.log('Initial stats:', initialStats);
    
    // Insert a test client directly into the database
    const testClient = {
      name: 'Real-time Test User',
      email: 'realtime-test@example.com',
      role: 'user',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('clients').insertOne(testClient);
    console.log('Inserted test client with ID:', result.insertedId.toString());
    
    // Verify the client was added
    const clientCount = await db.collection('clients').countDocuments();
    console.log('Total clients after insert:', clientCount);
    
    // List all clients to verify
    const clients = await db.collection('clients').find({}).toArray();
    console.log('All clients:', clients);
    
    // Wait for the real-time update to propagate
    console.log('Waiting for real-time update...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Get updated stats
    console.log('Getting updated stats...');
    const updatedStatsResponse = await fetch('http://localhost:3002/api/dashboard/stats');
    const updatedStats = await updatedStatsResponse.json();
    console.log('Updated stats:', updatedStats);
    
    // Check if the user count increased
    const initialUsers = initialStats.find(stat => stat.id === '1').value;
    const updatedUsers = updatedStats.find(stat => stat.id === '1').value;
    
    if (updatedUsers > initialUsers) {
      console.log('✅ Real-time update successful! User count increased from', initialUsers, 'to', updatedUsers);
    } else {
      console.log('❌ Real-time update failed. User count did not increase.');
      console.log('Initial users:', initialUsers, 'Updated users:', updatedUsers);
    }
    
    // Clean up - delete the test client
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

testRealTimeUpdate();