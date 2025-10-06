const redis = require('redis');

async function testRedis() {
  try {
    // Create Redis client
    const client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    client.on('error', (err) => {
      console.error('Redis error:', err);
    });

    client.on('connect', () => {
      console.log('Connected to Redis');
    });

    client.on('ready', () => {
      console.log('Redis client ready');
    });

    // Connect to Redis
    await client.connect();
    
    // Test setting and getting a value
    await client.set('test-key', 'test-value');
    const value = await client.get('test-key');
    console.log('Retrieved value:', value);
    
    // Test publishing to a channel
    const result = await client.publish('client_activity_channel', JSON.stringify({
      event: 'test_event',
      message: 'Hello from Redis test!'
    }));
    console.log('Published message to channel, subscribers:', result);
    
    // Close the connection
    await client.quit();
    console.log('Disconnected from Redis');
  } catch (error) {
    console.error('Error:', error);
  }
}

testRedis();