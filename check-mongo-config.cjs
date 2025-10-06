const { MongoClient } = require('mongodb');

// Check MongoDB configuration
async function checkMongoConfig() {
  try {
    console.log('Checking MongoDB configuration...');
    
    // Connect to MongoDB
    const client = new MongoClient('mongodb://localhost:27017/ev_bunker');
    await client.connect();
    console.log('✅ MongoDB connected');
    
    const db = client.db();
    
    // Check if it's a replica set
    const isMaster = await db.admin().command({ isMaster: 1 });
    console.log('isMaster result:', JSON.stringify(isMaster, null, 2));
    
    if (isMaster.setName) {
      console.log('✅ MongoDB is running in replica set mode:', isMaster.setName);
    } else {
      console.log('⚠️ MongoDB is running in standalone mode - change streams will not work');
      console.log('To enable change streams, MongoDB must be running in replica set mode');
    }
    
    // List databases
    const databases = await client.db().admin().listDatabases();
    console.log('Available databases:', databases.databases.map(d => d.name));
    
    await client.close();
  } catch (error) {
    console.error('❌ MongoDB configuration check failed:', error.message);
  }
}

checkMongoConfig().catch(console.error);