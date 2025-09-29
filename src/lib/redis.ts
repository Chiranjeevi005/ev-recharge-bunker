import Redis from 'ioredis';

// Create Redis client with error handling
let redisClient: Redis | null = null;
let isRedisAvailable = false;

try {
  // Only initialize Redis if URL is provided
  if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL);
    
    redisClient.on('connect', () => {
      console.log('Connected to Redis');
      isRedisAvailable = true;
    });

    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
      isRedisAvailable = false;
    });

    redisClient.on('close', () => {
      console.log('Redis connection closed');
      isRedisAvailable = false;
    });
  } else {
    console.log('Redis not configured - running in fallback mode');
  }
} catch (error) {
  console.error('Failed to initialize Redis client:', error);
  isRedisAvailable = false;
}

// Safe Redis operations with fallbacks
const redis = {
  // Check if Redis is available
  isAvailable: () => isRedisAvailable && redisClient !== null,

  // Safe get method
  get: async (key: string): Promise<string | null> => {
    if (!redis.isAvailable()) {
      console.log('Redis not available - skipping GET operation');
      return null;
    }

    try {
      return await redisClient!.get(key);
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  },

  // Safe set method
  set: async (key: string, value: string): Promise<boolean> => {
    if (!redis.isAvailable()) {
      console.log('Redis not available - skipping SET operation');
      return false;
    }

    try {
      await redisClient!.set(key, value);
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  },

  // Safe setex method
  setex: async (key: string, ttl: number, value: string): Promise<boolean> => {
    if (!redis.isAvailable()) {
      console.log('Redis not available - skipping SETEX operation');
      return false;
    }

    try {
      await redisClient!.setex(key, ttl, value);
      return true;
    } catch (error) {
      console.error('Redis SETEX error:', error);
      return false;
    }
  },

  // Safe publish method
  publish: async (channel: string, message: string): Promise<number> => {
    if (!redis.isAvailable()) {
      console.log('Redis not available - skipping PUBLISH operation');
      return 0;
    }

    try {
      return await redisClient!.publish(channel, message);
    } catch (error) {
      console.error('Redis PUBLISH error:', error);
      return 0;
    }
  },

  // Safe subscribe method
  subscribe: async (channel: string): Promise<void> => {
    if (!redis.isAvailable()) {
      console.log('Redis not available - skipping SUBSCRIBE operation');
      return;
    }

    try {
      await redisClient!.subscribe(channel);
    } catch (error) {
      console.error('Redis SUBSCRIBE error:', error);
    }
  },

  // Event listener
  on: (event: string, listener: (...args: any[]) => void): void => {
    if (redis.isAvailable()) {
      redisClient!.on(event, listener);
    }
  }
};

export default redis;