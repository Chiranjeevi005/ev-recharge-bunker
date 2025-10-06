const { MongoClient } = require('mongodb');

// Test MongoDB change streams directly
async function testChangeStreams() {
  try {
    console.log('Testing MongoDB change streams...');
    
    // Connect to MongoDB
    const client = new MongoClient('mongodb://localhost:27017/ev_bunker');
    await client.connect();
    console.log('✅ MongoDB connected');
    
    const db = client.db();
    const clientsCollection = db.collection('clients');
    
    // Set up change stream
    console.log('Setting up change stream...');
    const changeStream = clientsCollection.watch([], { 
      fullDocument: 'updateLookup'
    });
    
    changeStream.on('change', (change) => {
      console.log('📬 Change detected:', change.operationType);
      if (change.fullDocument) {
        console.log('   Document:', change.fullDocument.name);
      }
    });
    
    changeStream.on('error', (error) => {
      console.error('❌ Change stream error:', error);
    });
    
    console.log('🎧 Change stream listening...');
    
    // Insert a test document
    console.log('\n📝 Inserting test document...');
    const testDoc = {
      name: 'Change Stream Test User',
      email: 'changestream-test@example.com',
      role: 'user',
      status: 'active',
      createdAt: new Date()
    };
    
    const result = await clientsCollection.insertOne(testDoc);
    console.log('✅ Test document inserted:', result.insertedId);
    
    // Wait to see if we receive the change
    console.log('\n⏳ Waiting for change event...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update the document
    console.log('\n✏️ Updating test document...');
    const updateResult = await clientsCollection.updateOne(
      { _id: result.insertedId },
      { $set: { status: 'inactive' } }
    );
    console.log('✅ Test document updated:', updateResult.modifiedCount);
    
    // Wait to see if we receive the change
    console.log('\n⏳ Waiting for change event...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Clean up
    await changeStream.close();
    await client.close();
    
    console.log('\n✅ Change stream test completed');
  } catch (error) {
    console.error('❌ Change stream test failed:', error.message);
    console.error(error.stack);
  }
}

testChangeStreams().catch(console.error);