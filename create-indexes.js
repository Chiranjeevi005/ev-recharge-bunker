import { MongoClient } from 'mongodb';

async function createIndexes() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('ev_bunker');
    
    // Check existing indexes first
    console.log('Checking existing indexes...');
    
    // Create indexes for payments collection
    console.log('Creating indexes for payments collection...');
    try {
      const paymentsIndexes = await db.collection('payments').indexes();
      console.log('Existing payments indexes:', paymentsIndexes.map(idx => idx.name));
      
      // Only create indexes that don't already exist
      const newPaymentsIndexes = [
        { key: { status: 1 }, name: 'status_idx' },
        { key: { stationId: 1 }, name: 'stationId_idx' },
        { key: { createdAt: 1 }, name: 'createdAt_idx' },
        { key: { userId: 1 }, name: 'userId_idx' }
      ].filter(idx => !paymentsIndexes.some(existing => existing.name === idx.name));
      
      if (newPaymentsIndexes.length > 0) {
        await db.collection('payments').createIndexes(newPaymentsIndexes);
        console.log('New payments indexes created:', newPaymentsIndexes.map(idx => idx.name));
      } else {
        console.log('All payments indexes already exist');
      }
    } catch (error) {
      console.error('Error creating payments indexes:', error);
    }
    
    // Create indexes for stations collection
    console.log('Creating indexes for stations collection...');
    try {
      const stationsIndexes = await db.collection('stations').indexes();
      console.log('Existing stations indexes:', stationsIndexes.map(idx => idx.name));
      
      // Only create indexes that don't already exist
      const newStationsIndexes = [
        { key: { city: 1 }, name: 'city_idx' },
        { key: { status: 1 }, name: 'status_idx' },
        { key: { createdAt: 1 }, name: 'createdAt_idx' }
      ].filter(idx => !stationsIndexes.some(existing => existing.name === idx.name));
      
      if (newStationsIndexes.length > 0) {
        await db.collection('stations').createIndexes(newStationsIndexes);
        console.log('New stations indexes created:', newStationsIndexes.map(idx => idx.name));
      } else {
        console.log('All stations indexes already exist');
      }
    } catch (error) {
      console.error('Error creating stations indexes:', error);
    }
    
    // Create indexes for clients collection
    console.log('Creating indexes for clients collection...');
    try {
      const clientsIndexes = await db.collection('clients').indexes();
      console.log('Existing clients indexes:', clientsIndexes.map(idx => idx.name));
      
      // Only create indexes that don't already exist
      const newClientsIndexes = [
        { key: { role: 1 }, name: 'role_idx' },
        { key: { status: 1 }, name: 'status_idx' },
        { key: { city: 1 }, name: 'city_idx' },
        { key: { createdAt: 1 }, name: 'createdAt_idx' }
      ].filter(idx => !clientsIndexes.some(existing => existing.name === idx.name));
      
      if (newClientsIndexes.length > 0) {
        await db.collection('clients').createIndexes(newClientsIndexes);
        console.log('New clients indexes created:', newClientsIndexes.map(idx => idx.name));
      } else {
        console.log('All clients indexes already exist');
      }
    } catch (error) {
      console.error('Error creating clients indexes:', error);
    }
    
    // Create indexes for bookings collection
    console.log('Creating indexes for bookings collection...');
    try {
      const bookingsIndexes = await db.collection('bookings').indexes();
      console.log('Existing bookings indexes:', bookingsIndexes.map(idx => idx.name));
      
      // Only create indexes that don't already exist
      const newBookingsIndexes = [
        { key: { stationCity: 1 }, name: 'stationCity_idx' },
        { key: { userId: 1 }, name: 'userId_idx' },
        { key: { createdAt: 1 }, name: 'createdAt_idx' }
      ].filter(idx => !bookingsIndexes.some(existing => existing.name === idx.name));
      
      if (newBookingsIndexes.length > 0) {
        await db.collection('bookings').createIndexes(newBookingsIndexes);
        console.log('New bookings indexes created:', newBookingsIndexes.map(idx => idx.name));
      } else {
        console.log('All bookings indexes already exist');
      }
    } catch (error) {
      console.error('Error creating bookings indexes:', error);
    }
    
    console.log('Index creation process completed!');
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    await client.close();
  }
}

createIndexes();