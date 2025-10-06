const redis = require('redis');

async function clearRedisCache() {
  let redisClient;
  
  try {
    // Connect to Redis
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    await redisClient.connect();
    console.log('Connected to Redis');
    
    // Clear the dashboard stats cache
    await redisClient.del('dashboard_stats');
    console.log('Cleared dashboard stats cache');
    
    // Check if the key exists
    const exists = await redisClient.exists('dashboard_stats');
    console.log('Dashboard stats key exists:', exists);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (redisClient) {
      await redisClient.quit();
      console.log('Disconnected from Redis');
    }
  }
}

clearRedisCache();