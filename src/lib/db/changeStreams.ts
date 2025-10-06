import { connectToDatabase } from '@/lib/db/connection';
import { Db } from 'mongodb';
import redis from '@/lib/realtime/redisQueue';
import type { ChangeStreamDocument, ChangeStreamInsertDocument, ChangeStreamUpdateDocument, ChangeStreamDeleteDocument } from 'mongodb';

// Store change stream references for proper cleanup
const changeStreams: any[] = [];
let isReplicaSetMode = true;

// Function to simulate change streams in standalone mode using polling
async function setupPollingFallback(db: Db) {
  console.log('Setting up polling fallback for standalone MongoDB mode');
  
  // Poll for changes every 10 seconds
  const pollingInterval = setInterval(async () => {
    try {
      // For demo purposes, we'll simulate changes by publishing a dummy update
      // In a real implementation, you would compare the current state with the previous state
      const now = new Date().toISOString();
      
      // Simulate a client update
      const clientEvent = {
        event: 'client_update',
        operationType: 'update',
        documentKey: 'polling-' + now,
        timestamp: now
      };
      
      if (redis.isAvailable()) {
        try {
          await redis.enqueueMessage('client_activity_channel', JSON.stringify(clientEvent));
          console.log('Published polling update to Redis');
        } catch (error) {
          console.error('Error publishing polling update to Redis:', error);
        }
      }
    } catch (error) {
      console.error('Error in polling fallback:', error);
    }
  }, 10000);
  
  return pollingInterval;
}

// Initialize change streams for key collections
export async function initializeChangeStreams() {
  try {
    const { db } = await connectToDatabase();
    const typedDb = db as Db;
    
    console.log('Initializing change streams for database:', typedDb.databaseName);
    
    // Check if MongoDB is running in replica set mode
    try {
      const isMaster = await typedDb.admin().command({ isMaster: 1 });
      if (!isMaster['setName']) {
        console.warn('MongoDB is running in standalone mode - change streams not supported');
        isReplicaSetMode = false;
        
        // Set up polling fallback
        const pollingInterval = await setupPollingFallback(typedDb);
        
        // Store the polling interval for cleanup
        changeStreams.push({ name: 'polling', interval: pollingInterval });
        
        return true;
      }
    } catch (error) {
      console.error('Error checking MongoDB mode:', error);
      isReplicaSetMode = false;
      return false;
    }
    
    if (!isReplicaSetMode) {
      // Already set up polling fallback
      return true;
    }
    
    // Watch clients collection
    const clientsCollection = typedDb.collection('clients');
    const clientsChangeStream = clientsCollection.watch([], { 
      fullDocument: 'updateLookup',
      // Add resumable options
      resumeAfter: null,
      startAfter: null,
      maxAwaitTimeMS: 60000
    });
    
    clientsChangeStream.on('change', async (change: ChangeStreamDocument) => {
      console.log('Client change detected:', change.operationType, (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument | ChangeStreamDeleteDocument).documentKey);
      
      // Prepare the event data
      const eventData = {
        event: 'client_update',
        operationType: change.operationType,
        documentKey: (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument | ChangeStreamDeleteDocument).documentKey ? (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument | ChangeStreamDeleteDocument).documentKey!['_id'].toString() : null,
        fullDocument: (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument).fullDocument ? {
          ...(change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument).fullDocument,
          id: (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument).fullDocument!['_id'].toString(),
          _id: undefined
        } : null,
        timestamp: new Date().toISOString()
      };
      
      // Publish to Redis
      if (redis.isAvailable()) {
        try {
          await redis.enqueueMessage('client_activity_channel', JSON.stringify(eventData));
          console.log('Published client update to Redis');
        } catch (error) {
          console.error('Error publishing client update to Redis:', error);
        }
      }
      
      // Also publish eco stats update when clients change to trigger dashboard updates
      if (redis.isAvailable()) {
        try {
          await redis.enqueueMessage('client_activity_channel', JSON.stringify({
            event: 'eco_stats_update',
            operationType: change.operationType,
            documentKey: (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument | ChangeStreamDeleteDocument).documentKey ? (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument | ChangeStreamDeleteDocument).documentKey!['_id'].toString() : null,
            timestamp: new Date().toISOString()
          }));
          console.log('Published eco stats update to Redis due to client change');
        } catch (error) {
          console.error('Error publishing eco stats update to Redis:', error);
        }
      }
    });
    
    clientsChangeStream.on('error', (error) => {
      console.error('Clients change stream error:', error);
      // Attempt to resume the change stream
      handleChangeStreamError(error, 'clients');
    });
    
    clientsChangeStream.on('end', () => {
      console.log('Clients change stream ended');
    });
    
    changeStreams.push({ name: 'clients', stream: clientsChangeStream });
    
    // Watch stations collection
    const stationsCollection = typedDb.collection('stations');
    const stationsChangeStream = stationsCollection.watch([], { 
      fullDocument: 'updateLookup',
      resumeAfter: null,
      startAfter: null,
      maxAwaitTimeMS: 60000
    });
    
    stationsChangeStream.on('change', async (change: ChangeStreamDocument) => {
      console.log('Station change detected:', change.operationType, (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument | ChangeStreamDeleteDocument).documentKey);
      
      // Prepare the event data
      const eventData = {
        event: 'station_update',
        operationType: change.operationType,
        documentKey: (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument | ChangeStreamDeleteDocument).documentKey ? (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument | ChangeStreamDeleteDocument).documentKey!['_id'].toString() : null,
        fullDocument: (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument).fullDocument ? {
          ...(change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument).fullDocument,
          id: (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument).fullDocument!['_id'].toString(),
          _id: undefined
        } : null,
        timestamp: new Date().toISOString()
      };
      
      // Publish to Redis
      if (redis.isAvailable()) {
        try {
          await redis.enqueueMessage('client_activity_channel', JSON.stringify(eventData));
          console.log('Published station update to Redis');
        } catch (error) {
          console.error('Error publishing station update to Redis:', error);
        }
      }
      
      // Also publish eco stats update when stations change to trigger dashboard updates
      if (redis.isAvailable()) {
        try {
          await redis.enqueueMessage('client_activity_channel', JSON.stringify({
            event: 'eco_stats_update',
            operationType: change.operationType,
            documentKey: (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument | ChangeStreamDeleteDocument).documentKey ? (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument | ChangeStreamDeleteDocument).documentKey!['_id'].toString() : null,
            timestamp: new Date().toISOString()
          }));
          console.log('Published eco stats update to Redis due to station change');
        } catch (error) {
          console.error('Error publishing eco stats update to Redis:', error);
        }
      }
    });
    
    stationsChangeStream.on('error', (error) => {
      console.error('Stations change stream error:', error);
      // Attempt to resume the change stream
      handleChangeStreamError(error, 'stations');
    });
    
    stationsChangeStream.on('end', () => {
      console.log('Stations change stream ended');
    });
    
    changeStreams.push({ name: 'stations', stream: stationsChangeStream });
    
    // Watch charging_sessions collection
    const chargingSessionsCollection = typedDb.collection('charging_sessions');
    const chargingSessionsChangeStream = chargingSessionsCollection.watch([], { 
      fullDocument: 'updateLookup',
      resumeAfter: null,
      startAfter: null,
      maxAwaitTimeMS: 60000
    });
    
    chargingSessionsChangeStream.on('change', async (change: ChangeStreamDocument) => {
      console.log('Charging session change detected:', change.operationType, (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument | ChangeStreamDeleteDocument).documentKey);
      
      // Prepare the event data
      const eventData = {
        event: 'charging_session_update',
        operationType: change.operationType,
        documentKey: (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument | ChangeStreamDeleteDocument).documentKey ? (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument | ChangeStreamDeleteDocument).documentKey!['_id'].toString() : null,
        fullDocument: (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument).fullDocument ? {
          ...(change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument).fullDocument,
          id: (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument).fullDocument!['_id'].toString(),
          _id: undefined
        } : null,
        timestamp: new Date().toISOString()
      };
      
      // Publish to Redis
      if (redis.isAvailable()) {
        try {
          await redis.enqueueMessage('client_activity_channel', JSON.stringify(eventData));
          console.log('Published charging session update to Redis');
        } catch (error) {
          console.error('Error publishing charging session update to Redis:', error);
        }
      }
    });
    
    chargingSessionsChangeStream.on('error', (error) => {
      console.error('Charging sessions change stream error:', error);
      // Attempt to resume the change stream
      handleChangeStreamError(error, 'charging_sessions');
    });
    
    chargingSessionsChangeStream.on('end', () => {
      console.log('Charging sessions change stream ended');
    });
    
    changeStreams.push({ name: 'charging_sessions', stream: chargingSessionsChangeStream });
    
    // Watch payments collection
    const paymentsCollection = typedDb.collection('payments');
    const paymentsChangeStream = paymentsCollection.watch([], { 
      fullDocument: 'updateLookup',
      resumeAfter: null,
      startAfter: null,
      maxAwaitTimeMS: 60000
    });
    
    paymentsChangeStream.on('change', async (change: ChangeStreamDocument) => {
      console.log('Payment change detected:', change.operationType, (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument | ChangeStreamDeleteDocument).documentKey);
      
      // Prepare the event data
      const eventData = {
        event: 'payment_update',
        operationType: change.operationType,
        documentKey: (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument | ChangeStreamDeleteDocument).documentKey ? (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument | ChangeStreamDeleteDocument).documentKey!['_id'].toString() : null,
        fullDocument: (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument).fullDocument ? {
          ...(change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument).fullDocument,
          id: (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument).fullDocument!['_id'].toString(),
          _id: undefined
        } : null,
        timestamp: new Date().toISOString()
      };
      
      // Publish to Redis
      if (redis.isAvailable()) {
        try {
          await redis.enqueueMessage('client_activity_channel', JSON.stringify(eventData));
          console.log('Published payment update to Redis');
        } catch (error) {
          console.error('Error publishing payment update to Redis:', error);
        }
      }
      
      // Also publish eco stats update when payments change to trigger dashboard updates
      if (redis.isAvailable()) {
        try {
          await redis.enqueueMessage('client_activity_channel', JSON.stringify({
            event: 'eco_stats_update',
            operationType: change.operationType,
            documentKey: (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument | ChangeStreamDeleteDocument).documentKey ? (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument | ChangeStreamDeleteDocument).documentKey!['_id'].toString() : null,
            timestamp: new Date().toISOString()
          }));
          console.log('Published eco stats update to Redis due to payment change');
        } catch (error) {
          console.error('Error publishing eco stats update to Redis:', error);
        }
      }
    });
    
    paymentsChangeStream.on('error', (error) => {
      console.error('Payments change stream error:', error);
      // Attempt to resume the change stream
      handleChangeStreamError(error, 'payments');
    });
    
    paymentsChangeStream.on('end', () => {
      console.log('Payments change stream ended');
    });
    
    changeStreams.push({ name: 'payments', stream: paymentsChangeStream });
    
    // Watch eco_stats collection
    const ecoStatsCollection = typedDb.collection('eco_stats');
    const ecoStatsChangeStream = ecoStatsCollection.watch([], { 
      fullDocument: 'updateLookup',
      resumeAfter: null,
      startAfter: null,
      maxAwaitTimeMS: 60000
    });
    
    ecoStatsChangeStream.on('change', async (change: ChangeStreamDocument) => {
      console.log('Eco stats change detected:', change.operationType, (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument | ChangeStreamDeleteDocument).documentKey);
      
      // Prepare the event data
      const eventData = {
        event: 'eco_stats_update',
        operationType: change.operationType,
        documentKey: (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument | ChangeStreamDeleteDocument).documentKey ? (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument | ChangeStreamDeleteDocument).documentKey!['_id'].toString() : null,
        fullDocument: (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument).fullDocument ? {
          ...(change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument).fullDocument,
          id: (change as ChangeStreamInsertDocument | ChangeStreamUpdateDocument).fullDocument!['_id'].toString(),
          _id: undefined
        } : null,
        timestamp: new Date().toISOString()
      };
      
      // Publish to Redis
      if (redis.isAvailable()) {
        try {
          await redis.enqueueMessage('client_activity_channel', JSON.stringify(eventData));
          console.log('Published eco stats update to Redis');
        } catch (error) {
          console.error('Error publishing eco stats update to Redis:', error);
        }
      }
    });
    
    ecoStatsChangeStream.on('error', (error) => {
      console.error('Eco stats change stream error:', error);
      // Attempt to resume the change stream
      handleChangeStreamError(error, 'eco_stats');
    });
    
    ecoStatsChangeStream.on('end', () => {
      console.log('Eco stats change stream ended');
    });
    
    changeStreams.push({ name: 'eco_stats', stream: ecoStatsChangeStream });
    
    console.log('MongoDB change streams initialized successfully');
    return true;
  } catch (error: any) {
    console.error('Error initializing MongoDB change streams:', error);
    
    // Provide more specific error messages
    if (error.message && error.message.includes('Authentication failed')) {
      console.error('MongoDB authentication failed. Please check your credentials in .env.local');
    } else if (error.message && error.message.includes('connect ECONNREFUSED')) {
      console.error('MongoDB connection refused. Please check if your MongoDB server is running');
    } else if (error.message && error.message.includes('The $changeStream stage is only supported on replica sets')) {
      console.warn('MongoDB is running in standalone mode - change streams not supported. Setting up polling fallback.');
      isReplicaSetMode = false;
      
      // Try to set up polling fallback
      try {
        const { db } = await connectToDatabase();
        const typedDb = db as Db;
        const pollingInterval = await setupPollingFallback(typedDb);
        changeStreams.push({ name: 'polling', interval: pollingInterval });
        console.log('Polling fallback initialized successfully');
        return true;
      } catch (pollingError) {
        console.error('Error setting up polling fallback:', pollingError);
      }
    }
    
    return false;
  }
}

// Handle change stream errors and attempt to resume
function handleChangeStreamError(error: any, collectionName: string) {
  console.error(`Change stream error for ${collectionName}:`, error);
  
  // Log error details
  if (error.code) {
    console.error(`Error code: ${error.code}`);
  }
  if (error.message) {
    console.error(`Error message: ${error.message}`);
  }
  
  // Depending on the error, you might want to restart the change stream
  // For now, we'll just log the error
}

// Cleanup function to close all change streams
export function closeChangeStreams() {
  console.log('Closing MongoDB change streams...');
  changeStreams.forEach(({ name, stream, interval }) => {
    try {
      if (stream) {
        stream.close();
        console.log(`Closed change stream for ${name}`);
      } else if (interval) {
        clearInterval(interval);
        console.log(`Closed polling interval for ${name}`);
      }
    } catch (error) {
      console.error(`Error closing ${name}:`, error);
    }
  });
  changeStreams.length = 0; // Clear the array
}

export { changeStreams };