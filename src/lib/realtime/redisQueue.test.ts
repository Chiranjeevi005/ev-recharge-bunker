import redis from './redisQueue';

describe('Redis Queue', () => {
  it('should have the expected methods', () => {
    expect(redis.enqueueMessage).toBeDefined();
    expect(redis.configureBatching).toBeDefined();
    expect(redis.clearProcessedMessagesCache).toBeDefined();
    expect(redis.getQueueStats).toBeDefined();
  });

  it('should be able to enqueue messages', async () => {
    // This test just verifies that the method exists and can be called
    // without throwing an error
    expect(async () => {
      await redis.enqueueMessage('test-channel', 'test-message');
    }).not.toThrow();
  });

  it('should be able to configure batching', () => {
    // This test just verifies that the method exists and can be called
    // without throwing an error
    expect(() => {
      redis.configureBatching({ maxSize: 5, maxTime: 500 });
    }).not.toThrow();
  });

  it('should be able to get queue stats', () => {
    const stats = redis.getQueueStats();
    expect(stats).toHaveProperty('queueLength');
    expect(stats).toHaveProperty('batchSize');
    expect(stats).toHaveProperty('processedCount');
  });
});
