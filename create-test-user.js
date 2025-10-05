const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

async function createTestUser() {
  const client = new MongoClient(process.env.DATABASE_URL);
  
  try {
    await client.connect();
    const db = client.db('ev_bunker');
    
    // Check if user already exists
    const existingUser = await db.collection('clients').findOne({ email: 'user@example.com' });
    
    if (existingUser) {
      console.log('User already exists:');
      console.log('Email: user@example.com');
      console.log('Password: user123');
      console.log('Name:', existingUser.name);
      return;
    }
    
    // Create the client
    const clientResult = await db.collection('clients').insertOne({
      name: 'Test User',
      email: 'user@example.com',
      googleId: `credentials-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      role: 'client',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const newClient = await db.collection('clients').findOne({ _id: clientResult.insertedId });
    
    // Create an account record to store the password
    await db.collection('accounts').insertOne({
      userId: newClient._id.toString(),
      type: 'credentials',
      provider: 'client-credentials',
      providerAccountId: newClient._id.toString(),
      access_token: 'user123',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Test user created successfully!');
    console.log('Email: user@example.com');
    console.log('Password: user123');
    console.log('Name: Test User');
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await client.close();
  }
}

createTestUser();