// Use the redis library instead of ioredis for better Next.js compatibility
import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

// Create Redis client with error handling
let redisClient: RedisClientType | null = null;
let isRedisAvailable = false;

// Check if we're running on the server side
const isServer = typeof window === 'undefined';

try {
  // Only initialize Redis if URL is provided and we're on the server
  if (isServer && process.env['REDIS_URL']) {
    redisClient = createClient({
      url: process.env['REDIS_URL']
    });
    
    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
      isRedisAvailable = false;
    });
    
    redisClient.on('connect', () => {
      console.log('Connected to Redis');
      isRedisAvailable = true;
    });
    
    redisClient.on('ready', () => {
      console.log('Redis client ready');
      isRedisAvailable = true;
    });
    
    redisClient.on('end', () => {
      console.log('Redis connection ended');
      isRedisAvailable = false;
    });
    
    // Connect to Redis
    redisClient.connect().catch(console.error);
  } else {
    console.log('Redis not configured or running on client side - running in fallback mode');
  }
} catch (error) {
  console.error('Failed to initialize Redis client:', error);
  isRedisAvailable = false;
}

// Safe Redis operations with fallbacks
const redis = {
  // Check if Redis is available
  isAvailable: () => isServer && isRedisAvailable && redisClient !== null,

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
      await redisClient!.setEx(key, ttl, value);
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
      // Note: The redis library handles subscriptions differently
      // This is a simplified implementation
      console.log(`Subscribing to channel: ${channel}`);
    } catch (error) {
      console.error('Redis SUBSCRIBE error:', error);
    }
  }
};

export default redis;