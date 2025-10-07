// Create admin user script
require('dotenv').config({ path: './config/.env.production' });
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  let client;
  try {
    console.log('Creating admin user...');
    
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
    
    // Hash the admin password
    const hashedPassword = await bcrypt.hash("admin123", 12);
    
    // Check if admin already exists
    const existingAdmin = await db.collection("admins").findOne({ email: "admin@ebunker.com" });
    
    if (existingAdmin) {
      console.log('Admin user already exists, updating password...');
      // Update the existing admin with the proper password
      const result = await db.collection("admins").updateOne(
        { email: "admin@ebunker.com" },
        { 
          $set: { 
            password: hashedPassword,
            updatedAt: new Date()
          }
        }
      );
      console.log('✅ Admin user password updated successfully');
      return;
    }
    
    // Create admin user
    const result = await db.collection("admins").insertOne({
      email: "admin@ebunker.com",
      password: hashedPassword,
      createdAt: new Date(),
    });
    
    console.log('✅ Admin user created successfully with ID:', result.insertedId);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

createAdminUser().then(() => {
  console.log("\n🎉 Admin user creation/update completed successfully!");
  process.exit(0);
}).catch((error) => {
  console.error("\n💥 Admin user creation/update failed:", error);
  process.exit(1);
});