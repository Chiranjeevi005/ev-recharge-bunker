const { MongoClient } = require('mongodb');

async function checkClients() {
  let mongoClient;
  
  try {
    // Connect to MongoDB
    mongoClient = new MongoClient(process.env.DATABASE_URL || 'mongodb://localhost:27017/ev-bunker');
    await mongoClient.connect();
    console.log('Connected to MongoDB');
    
    const db = mongoClient.db();
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Check if clients collection exists
    const clientsCollectionExists = collections.some(c => c.name === 'clients');
    console.log('Clients collection exists:', clientsCollectionExists);
    
    // Count clients
    const clientCount = await db.collection('clients').countDocuments();
    console.log('Total clients in database:', clientCount);
    
    // List all clients
    const clients = await db.collection('clients').find({}).toArray();
    console.log('All clients:', clients);
    
    // Check if there are any clients with different query
    const allDocs = await db.collection('clients').find({}).toArray();
    console.log('All documents in clients collection:', allDocs);
    
    // Check if there are any other collections that might contain clients
    const possibleClientCollections = collections.filter(c => 
      c.name.includes('client') || c.name.includes('user') || c.name.includes('User')
    );
    console.log('Possible client collections:', possibleClientCollections.map(c => c.name));
    
    // Check these collections
    for (const collectionName of possibleClientCollections.map(c => c.name)) {
      const count = await db.collection(collectionName).countDocuments();
      console.log(`Documents in ${collectionName}:`, count);
      if (count > 0) {
        const docs = await db.collection(collectionName).find({}).limit(5).toArray();
        console.log(`Sample documents from ${collectionName}:`, docs);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (mongoClient) {
      await mongoClient.close();
      console.log('Disconnected from MongoDB');
    }
  }
}

checkClients();