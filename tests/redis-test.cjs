// Test Redis connection
const { createClient } = require('redis');
require('dotenv').config();

async function testRedis() {
  try {
    console.log('Testing Redis connection...');
    
    // Use the Redis URI from environment variables
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      console.log('REDIS_URL not found in environment variables');
      return;
    }
    
    console.log('Using Redis URI:', redisUrl.replace(/:\/\/.*@/, '://***@')); // Hide credentials
    
    // Create Redis client
    const client = createClient({
      url: redisUrl
    });
    
    // Handle errors
    client.on('error', (err) => {
      console.error('Redis error:', err.message);
    });
    
    // Connect to Redis
    await client.connect();
    console.log('Connected to Redis successfully');
    
    // Test Redis operations
    await client.set('test-key', 'test-value');
    const value = await client.get('test-key');
    console.log('Redis SET/GET test:', value);
    
    // Test pub/sub
    await client.subscribe('test-channel', (message) => {
      console.log('Received message from test-channel:', message);
    });
    console.log('Subscribed to test-channel');
    
    // Close connection
    await client.quit();
    console.log('Redis test completed successfully!');
  } catch (error) {
    console.error('Redis test failed:', error.message);
  }
}

testRedis().then(() => {
  console.log("Redis test completed");
  process.exit(0);
}).catch((error) => {
  console.error("Redis test failed:", error);
  process.exit(1);
});