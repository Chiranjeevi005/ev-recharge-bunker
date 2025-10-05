import { connectToDatabase } from '@/lib/db/connection';
import redis from '@/lib/realtime/redis';
import type { ChangeStreamDocument, ChangeStreamInsertDocument, ChangeStreamUpdateDocument, ChangeStreamDeleteDocument } from 'mongodb';

// Store change stream references for proper cleanup
const changeStreams: any[] = [];

// Initialize change streams for key collections
export async function initializeChangeStreams() {
  try {
    const { db } = await connectToDatabase();
    
    // Watch clients collection
    const clientsCollection = db.collection('clients');
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
          await redis.publish('client_activity_channel', JSON.stringify(eventData));
          console.log('Published client update to Redis');
        } catch (error) {
          console.error('Error publishing client update to Redis:', error);
        }
      }
      
      // Also publish eco stats update when clients change to trigger dashboard updates
      if (redis.isAvailable()) {
        try {
          await redis.publish('client_activity_channel', JSON.stringify({
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
    const stationsCollection = db.collection('stations');
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
          await redis.publish('client_activity_channel', JSON.stringify(eventData));
          console.log('Published station update to Redis');
        } catch (error) {
          console.error('Error publishing station update to Redis:', error);
        }
      }
      
      // Also publish eco stats update when stations change to trigger dashboard updates
      if (redis.isAvailable()) {
        try {
          await redis.publish('client_activity_channel', JSON.stringify({
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
    const chargingSessionsCollection = db.collection('charging_sessions');
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
          await redis.publish('client_activity_channel', JSON.stringify(eventData));
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
    const paymentsCollection = db.collection('payments');
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
          await redis.publish('client_activity_channel', JSON.stringify(eventData));
          console.log('Published payment update to Redis');
        } catch (error) {
          console.error('Error publishing payment update to Redis:', error);
        }
      }
      
      // Also publish eco stats update when payments change to trigger dashboard updates
      if (redis.isAvailable()) {
        try {
          await redis.publish('client_activity_channel', JSON.stringify({
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
    const ecoStatsCollection = db.collection('eco_stats');
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
          await redis.publish('client_activity_channel', JSON.stringify(eventData));
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
  changeStreams.forEach(({ name, stream }) => {
    try {
      stream.close();
      console.log(`Closed change stream for ${name}`);
    } catch (error) {
      console.error(`Error closing change stream for ${name}:`, error);
    }
  });
  changeStreams.length = 0; // Clear the array
}

export { changeStreams };