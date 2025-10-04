import { connectToDatabase } from '@/lib/db/connection';
import redis from '@/lib/redis';
import type { ChangeStreamDocument, ChangeStreamInsertDocument, ChangeStreamUpdateDocument, ChangeStreamDeleteDocument } from 'mongodb';

// Initialize change streams for key collections
export async function initializeChangeStreams() {
  try {
    const { db } = await connectToDatabase();
    
    // Watch clients collection
    const clientsCollection = db.collection('clients');
    const clientsChangeStream = clientsCollection.watch([], { fullDocument: 'updateLookup' });
    
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
    });
    
    clientsChangeStream.on('error', (error) => {
      console.error('Clients change stream error:', error);
    });
    
    // Watch charging_sessions collection
    const chargingSessionsCollection = db.collection('charging_sessions');
    const chargingSessionsChangeStream = chargingSessionsCollection.watch([], { fullDocument: 'updateLookup' });
    
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
    });
    
    // Watch payments collection
    const paymentsCollection = db.collection('payments');
    const paymentsChangeStream = paymentsCollection.watch([], { fullDocument: 'updateLookup' });
    
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
    });
    
    paymentsChangeStream.on('error', (error) => {
      console.error('Payments change stream error:', error);
    });
    
    // Watch eco_stats collection
    const ecoStatsCollection = db.collection('eco_stats');
    const ecoStatsChangeStream = ecoStatsCollection.watch([], { fullDocument: 'updateLookup' });
    
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
    });
    
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