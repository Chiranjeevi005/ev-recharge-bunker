// Use the redis library instead of ioredis for better Next.js compatibility
import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

// Create Redis client with error handling
let redisClient: RedisClientType | null = null;
let isRedisAvailable = false;
let isConnecting = false;

// Check if we're running on the server side
const isServer = typeof window === 'undefined';

// Initialize Redis connection with better error handling
async function initializeRedis() {
  // Only initialize Redis if URL is provided and we're on the server
  if (!isServer || !process.env['REDIS_URL'] || isConnecting) {
    console.log('Redis not configured, running on client side, or already connecting - running in fallback mode');
    return;
  }

  try {
    isConnecting = true;
    
    // If we already have a client, check if it's still connected
    if (redisClient) {
      try {
        await redisClient.ping();
        console.log('Redis client already connected');
        isRedisAvailable = true;
        isConnecting = false;
        return;
      } catch (pingError) {
        console.log('Redis client connection lost, creating new connection');
        redisClient = null;
        isRedisAvailable = false;
      }
    }

    console.log('Initializing Redis client with URL:', process.env['REDIS_URL'].replace(/:\/\/.*@/, '://***@')); // Hide credentials in logs
    
    // Check if the URL starts with 'rediss://' to enable TLS
    const isTLS = process.env['REDIS_URL']?.startsWith('rediss://');
    
    redisClient = createClient({
      url: process.env['REDIS_URL'],
      socket: isTLS ? {
        tls: true,
        rejectUnauthorized: false, // Set to true in production with proper certificates
        reconnectStrategy: (retries: number) => {
          if (retries > 3) {
            console.log('Redis reconnection attempts exceeded, giving up');
            isRedisAvailable = false;
            return new Error('Retry time exhausted');
          }
          console.log(`Redis reconnecting attempt ${retries}`);
          return Math.min(retries * 100, 3000);
        }
      } : {
        reconnectStrategy: (retries: number) => {
          if (retries > 3) {
            console.log('Redis reconnection attempts exceeded, giving up');
            isRedisAvailable = false;
            return new Error('Retry time exhausted');
          }
          console.log(`Redis reconnecting attempt ${retries}`);
          return Math.min(retries * 100, 3000);
        }
      }
    } as any);
    
    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err.message || err);
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
    
    // Connect to Redis with timeout
    const connectPromise = redisClient.connect();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Redis connection timeout')), 5000);
    });
    
    await Promise.race([connectPromise, timeoutPromise]);
    console.log('Redis connection established successfully');
  } catch (error) {
    console.error('Failed to initialize Redis client:', error instanceof Error ? error.message : error);
    isRedisAvailable = false;
    redisClient = null;
  } finally {
    isConnecting = false;
  }
}

// Initialize Redis on module load
if (isServer && process.env['REDIS_URL']) {
  initializeRedis().catch(console.error);
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
      console.error('Redis GET error:', error instanceof Error ? error.message : error);
      // Try to reconnect
      await initializeRedis();
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
      console.error('Redis SET error:', error instanceof Error ? error.message : error);
      // Try to reconnect
      await initializeRedis();
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
      console.error('Redis SETEX error:', error instanceof Error ? error.message : error);
      // Try to reconnect
      await initializeRedis();
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
      console.error('Redis PUBLISH error:', error instanceof Error ? error.message : error);
      // Try to reconnect
      await initializeRedis();
      return 0;
    }
  },

  // Safe subscribe method
  subscribe: async (channel: string, handler?: (message: string) => void): Promise<void> => {
    if (!redis.isAvailable()) {
      console.log('Redis not available - skipping SUBSCRIBE operation');
      return;
    }

    try {
      await redisClient!.subscribe(channel, (message) => {
        // This is a placeholder - actual message handling should be done by the subscriber
        console.log(`Message received on channel ${channel}:`, message);
        if (handler) {
          handler(message);
        }
      });
      console.log(`Subscribed to channel: ${channel}`);
    } catch (error) {
      console.error('Redis SUBSCRIBE error:', error instanceof Error ? error.message : error);
      // Try to reconnect
      await initializeRedis();
    }
  },
  
  // Add on method for handling messages
  on: (event: string, handler: (channel: string, message: string) => void) => {
    if (!redis.isAvailable()) {
      console.log(`Redis not available - skipping ${event} event handler`);
      return;
    }
    
    if (event === 'message' && redisClient) {
      redisClient.on('message', handler);
    }
  },
  
  // Add reconnect method
  reconnect: async (): Promise<void> => {
    await initializeRedis();
  }
};

export default redis;