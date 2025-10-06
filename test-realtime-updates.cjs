const { MongoClient } = require('mongodb');
const redis = require('redis');

// Test real-time updates by inserting a client and checking if it triggers updates
async function testRealTimeUpdates() {
  try {
    console.log('Testing real-time updates...');
    
    // Connect to MongoDB
    const mongoClient = new MongoClient('mongodb://localhost:27017/ev_bunker');
    await mongoClient.connect();
    console.log('✅ MongoDB connected');
    
    const db = mongoClient.db();
    const clientsCollection = db.collection('clients');
    
    // Connect to Redis to listen for updates
    const redisClient = redis.createClient({
      url: 'redis://localhost:6379'
    });
    
    redisClient.on('error', (err) => {
      console.log('Redis error:', err);
    });
    
    await redisClient.connect();
    console.log('✅ Redis connected');
    
    // Subscribe to the client activity channel
    await redisClient.subscribe('client_activity_channel', (message) => {
      console.log('📬 Received real-time update:', message);
      try {
        const data = JSON.parse(message);
        console.log('   Event:', data.event);
        console.log('   Operation:', data.operationType);
        if (data.fullDocument) {
          console.log('   Document ID:', data.fullDocument._id);
          console.log('   Document Name:', data.fullDocument.name);
        }
      } catch (e) {
        console.log('   Error parsing message:', e.message);
      }
    });
    
    console.log('🎧 Subscribed to client_activity_channel');
    
    // Wait a moment for subscription to be established
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Insert a test client
    console.log('\n📝 Inserting test client...');
    const testClient = {
      name: 'Real-time Test User',
      email: 'realtime-test@example.com',
      role: 'user',
      status: 'active',
      createdAt: new Date()
    };
    
    const result = await clientsCollection.insertOne(testClient);
    console.log('✅ Test client inserted:', result.insertedId);
    
    // Wait to see if we receive the real-time update
    console.log('\n⏳ Waiting for real-time update...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update the client
    console.log('\n✏️ Updating test client...');
    const updateResult = await clientsCollection.updateOne(
      { _id: result.insertedId },
      { $set: { status: 'inactive' } }
    );
    console.log('✅ Test client updated:', updateResult.modifiedCount);
    
    // Wait to see if we receive the real-time update
    console.log('\n⏳ Waiting for real-time update...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Delete the client
    console.log('\n🗑️ Deleting test client...');
    const deleteResult = await clientsCollection.deleteOne({ _id: result.insertedId });
    console.log('✅ Test client deleted:', deleteResult.deletedCount);
    
    // Wait to see if we receive the real-time update
    console.log('\n⏳ Waiting for real-time update...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Clean up
    await redisClient.quit();
    await mongoClient.close();
    
    console.log('\n✅ Real-time update test completed');
  } catch (error) {
    console.error('❌ Real-time update test failed:', error.message);
  }
}

testRealTimeUpdates().catch(console.error);