const { MongoClient, ObjectId } = require('mongodb');
const redis = require('redis');

async function addTestClient() {
  let mongoClient;
  let redisClient;
  
  try {
    // Connect to MongoDB
    mongoClient = new MongoClient(process.env.DATABASE_URL || 'mongodb://localhost:27017/ev-bunker');
    await mongoClient.connect();
    console.log('Connected to MongoDB');
    
    const db = mongoClient.db();
    
    // Insert a test client
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
    
    // Connect to Redis
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    await redisClient.connect();
    console.log('Connected to Redis');
    
    // Publish update to Redis for real-time sync
    const clientData = {
      event: 'client_update',
      operationType: 'insert',
      documentKey: result.insertedId.toString(),
      fullDocument: {
        ...testClient,
        _id: result.insertedId.toString()
      },
      timestamp: new Date().toISOString()
    };
    
    await redisClient.publish('client_activity_channel', JSON.stringify(clientData));
    console.log('Published client update to Redis');
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Clean up - delete the test client
    await db.collection('clients').deleteOne({ _id: result.insertedId });
    console.log('Deleted test client');
    
    // Publish delete update to Redis
    const deleteData = {
      event: 'client_update',
      operationType: 'delete',
      documentKey: result.insertedId.toString(),
      timestamp: new Date().toISOString()
    };
    
    await redisClient.publish('client_activity_channel', JSON.stringify(deleteData));
    console.log('Published client delete to Redis');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (mongoClient) {
      await mongoClient.close();
      console.log('Disconnected from MongoDB');
    }
    if (redisClient) {
      await redisClient.quit();
      console.log('Disconnected from Redis');
    }
  }
}

addTestClient();