// Check admin password script
require('dotenv').config({ path: './config/.env.production' });
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function checkAdminPassword() {
  let client;
  try {
    console.log('Checking admin user password...');
    
    const mongoUri = process.env.DATABASE_URL || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables');
    }
    
    console.log('Using MongoDB Atlas URI:', mongoUri.replace(/\/\/.*@/, '//***@'));
    
    // Create MongoDB client
    client = new MongoClient(mongoUri);
    
    // Connect to database
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas successfully');
    
    // Get database
    const db = client.db();
    console.log('Database name:', db.databaseName);
    
    // Check if admin already exists
    const adminUser = await db.collection("admins").findOne({ email: "admin@ebunker.com" });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found');
    console.log('Email:', adminUser.email);
    console.log('Password field length:', adminUser.password?.length);
    console.log('Password field type:', typeof adminUser.password);
    
    // Check if password is hashed
    if (adminUser.password && adminUser.password.startsWith('$2b$')) {
      console.log('✅ Password is properly bcrypt hashed');
      
      // Test password verification
      const isMatch = await bcrypt.compare("admin123", adminUser.password);
      console.log('Password verification test (admin123):', isMatch ? '✅ PASS' : '❌ FAIL');
    } else {
      console.log('❌ Password is not bcrypt hashed');
      console.log('Password value:', adminUser.password);
    }
    
  } catch (error) {
    console.error('❌ Error checking admin user:', error.message);
    throw error;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

checkAdminPassword().then(() => {
  console.log("\n🎉 Admin password check completed!");
  process.exit(0);
}).catch((error) => {
  console.error("\n💥 Admin password check failed:", error);
  process.exit(1);
});