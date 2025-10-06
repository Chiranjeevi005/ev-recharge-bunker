import redis from './redis';
import { v4 as uuidv4 } from 'uuid';

// Type definitions
interface QueuedMessage {
  id: string;
  channel: string;
  message: string;
  timestamp: number;
  processed: boolean;
}

interface BatchConfig {
  maxSize: number;
  maxTime: number; // in milliseconds
}

// Default configuration
const DEFAULT_BATCH_CONFIG: BatchConfig = {
  maxSize: 10,
  maxTime: 1000 // 1 second
};

// In-memory storage for message queue and batching
const messageQueue: QueuedMessage[] = [];
let batchTimer: NodeJS.Timeout | null = null;
let currentBatch: QueuedMessage[] = [];
const processedMessages = new Set<string>(); // For idempotency

// Configuration
let batchConfig: BatchConfig = { ...DEFAULT_BATCH_CONFIG };

/**
 * Configure the batching behavior
 * @param config Batch configuration
 */
export function configureBatching(config: Partial<BatchConfig>): void {
  batchConfig = { ...batchConfig, ...config };
}

/**
 * Add a message to the queue with idempotency check
 * @param channel Redis channel to publish to
 * @param message Message content
 * @param messageId Optional unique identifier for the message (for idempotency)
 * @returns Promise<number> Number of clients that received the message
 */
export async function enqueueMessage(
  channel: string, 
  message: string, 
  messageId?: string
): Promise<number> {
  // Generate a unique ID for idempotency if not provided
  const id = messageId || `${channel}:${uuidv4()}`;
  
  // Idempotency check - if we've already processed this message, skip it
  if (processedMessages.has(id)) {
    console.log(`Message ${id} already processed, skipping`);
    return 0;
  }
  
  // Mark as processed
  processedMessages.add(id);
  
  // Add to queue
  const queuedMessage: QueuedMessage = {
    id,
    channel,
    message,
    timestamp: Date.now(),
    processed: false
  };
  
  messageQueue.push(queuedMessage);
  
  // Trigger batch processing
  processBatch();
  
  // Return 0 as actual publishing happens asynchronously
  return 0;
}

/**
 * Process messages in batches
 */
function processBatch(): void {
  // Clear any existing timer
  if (batchTimer) {
    clearTimeout(batchTimer);
    batchTimer = null;
  }
  
  // Add messages to current batch
  while (messageQueue.length > 0 && currentBatch.length < batchConfig.maxSize) {
    const message = messageQueue.shift();
    if (message) {
      currentBatch.push(message);
    }
  }
  
  // Check if we should publish the batch
  const shouldPublish = 
    currentBatch.length >= batchConfig.maxSize || 
    (currentBatch.length > 0 && currentBatch[0] !== undefined && (Date.now() - currentBatch[0].timestamp) >= batchConfig.maxTime);
  
  if (shouldPublish) {
    publishBatch();
  } else if (currentBatch.length > 0) {
    // Set a timer to publish the batch after maxTime
    batchTimer = setTimeout(() => {
      publishBatch();
    }, Math.max(0, currentBatch[0] ? batchConfig.maxTime - (Date.now() - currentBatch[0].timestamp) : 0));
  }
}

/**
 * Publish a batch of messages
 */
async function publishBatch(): Promise<void> {
  if (currentBatch.length === 0) return;
  
  const batch = [...currentBatch];
  currentBatch = [];
  
  try {
    // Group messages by channel for efficient publishing
    const channelGroups: Record<string, QueuedMessage[]> = {};
    
    for (const message of batch) {
      if (message && message.channel) {
        const channel = message.channel;
        if (!channelGroups[channel]) {
          channelGroups[channel] = [];
        }
        channelGroups[channel].push(message);
      }
    }
    
    // Publish messages for each channel
    const entries = Object.entries(channelGroups);
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (!entry) continue;
      const [channel, messages] = entry;
      if (!channel || !messages) continue;
      
      if (messages.length === 1) {
        // Single message, publish directly
        const message = messages[0];
        if (redis.isAvailable() && message) {
          try {
            await redis.publish(channel, message.message);
            console.log(`Published message to channel ${channel}`);
          } catch (error) {
            console.error(`Error publishing message to channel ${channel}:`, error);
            // Re-queue failed messages
            if (message) {
              messageQueue.push(message);
            }
          }
        }
      } else {
        // Multiple messages, create a batch message
        const batchPayload = {
          type: 'batch',
          messages: messages.map((m: QueuedMessage) => ({
            id: m.id,
            message: m.message,
            timestamp: m.timestamp
          })),
          timestamp: Date.now()
        };
        
        if (redis.isAvailable()) {
          try {
            await redis.publish(channel, JSON.stringify(batchPayload));
            console.log(`Published batch of ${messages.length} messages to channel ${channel}`);
          } catch (error) {
            console.error(`Error publishing batch to channel ${channel}:`, error);
            // Re-queue failed messages
            messageQueue.push(...messages);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error publishing batch:', error);
    // Re-queue all messages in case of batch failure
    messageQueue.push(...batch);
  }
}

/**
 * Clear processed messages cache to prevent memory leaks
 * @param maxAge Maximum age of messages to keep in cache (in milliseconds)
 */
export function clearProcessedMessagesCache(maxAge: number = 5 * 60 * 1000): void { // 5 minutes default
  // We don't have timestamps for processed messages, so we can't clear them based on age
  // In a production system, you might want to store timestamps with processed message IDs
  // For now, we'll just periodically clear the entire cache
  if (Math.random() < 0.01) { // 1% chance to clear cache to prevent memory leaks
    processedMessages.clear();
  }
}

/**
 * Get queue statistics
 */
export function getQueueStats(): {
  queueLength: number;
  batchSize: number;
  processedCount: number;
} {
  return {
    queueLength: messageQueue.length,
    batchSize: currentBatch.length,
    processedCount: processedMessages.size
  };
}

// Export the enhanced Redis module with batching capabilities
export default {
  ...redis,
  enqueueMessage,
  configureBatching,
  clearProcessedMessagesCache,
  getQueueStats,
  isAvailable: redis.isAvailable
};