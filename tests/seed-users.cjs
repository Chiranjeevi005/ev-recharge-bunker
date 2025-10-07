const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Test users
const testUsers = [
  {
    email: "admin@ebunker.com",
    password: "admin123",
    name: "Admin User",
    role: "admin"
  },
  {
    email: "test@example.com",
    password: "password123",
    name: "Test Client",
    role: "client"
  },
  {
    email: "user@example.com",
    password: "user123",
    name: "Another Client",
    role: "client"
  }
];

async function seedUsers() {
  try {
    // Get the MongoDB URI from environment variables
    const MONGODB_URI = process.env['DATABASE_URL'] || process.env['MONGODB_URI'] || 'mongodb://localhost:27017';
    const DB_NAME = 'ev_bunker'; // Default database name
    
    console.log(`Connecting to MongoDB at ${MONGODB_URI}`);
    
    // Connect to MongoDB
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    // Get the database
    const db = client.db(DB_NAME);
    
    console.log(`Connected to database: ${db.databaseName}`);
    
    // Insert test users
    for (const user of testUsers) {
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      
      const userData = {
        email: user.email,
        password: hashedPassword,
        name: user.name,
        role: user.role,
        googleId: `credentials-${user.email}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Check if user already exists
      const existingUser = await db.collection("clients").findOne({ email: user.email });
      if (!existingUser) {
        const result = await db.collection("clients").insertOne(userData);
        console.log(`Created user: ${user.email} with ID: ${result.insertedId}`);
      } else {
        console.log(`User already exists: ${user.email}`);
      }
    }
    
    // Close the connection
    await client.close();
    
    console.log("Users seeded successfully!");
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
}

// Run the seed function
seedUsers().then(() => {
  console.log("User seeding completed");
  process.exit(0);
}).catch((error) => {
  console.error("User seeding failed:", error);
  process.exit(1);
});