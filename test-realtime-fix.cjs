const { MongoClient } = require('mongodb');
const redis = require('redis');

// Test MongoDB connection
async function testMongoDB() {
  try {
    console.log('Testing MongoDB connection...');
    const client = new MongoClient('mongodb://localhost:27017/ev_bunker');
    await client.connect();
    console.log('✅ MongoDB connected successfully');
    
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Test inserting a client document
    const clientsCollection = db.collection('clients');
    const testClient = {
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      status: 'active',
      createdAt: new Date()
    };
    
    const result = await clientsCollection.insertOne(testClient);
    console.log('✅ Test client inserted:', result.insertedId);
    
    // Clean up - delete the test client
    await clientsCollection.deleteOne({ _id: result.insertedId });
    console.log('✅ Test client cleaned up');
    
    await client.close();
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
}

// Test Redis connection
async function testRedis() {
  try {
    console.log('Testing Redis connection...');
    const client = redis.createClient({
      url: 'redis://localhost:6379'
    });
    
    client.on('error', (err) => {
      console.log('Redis error:', err);
    });
    
    await client.connect();
    console.log('✅ Redis connected successfully');
    
    // Test setting and getting a value
    await client.set('test-key', 'test-value');
    const value = await client.get('test-key');
    console.log('✅ Redis set/get test:', value);
    
    await client.quit();
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('Running real-time functionality tests...\n');
  
  const mongoResult = await testMongoDB();
  console.log('');
  
  const redisResult = await testRedis();
  console.log('');
  
  if (mongoResult && redisResult) {
    console.log('✅ All tests passed! Real-time functionality should work properly.');
  } else {
    console.log('❌ Some tests failed. Real-time functionality may not work properly.');
    
    if (!mongoResult) {
      console.log('  - MongoDB connection issue needs to be fixed');
    }
    
    if (!redisResult) {
      console.log('  - Redis connection issue needs to be fixed');
      console.log('  - If Redis is not installed, real-time features will run in fallback mode');
    }
  }
}

runTests().catch(console.error);