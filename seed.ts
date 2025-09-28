import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main() {
  // Check if DATABASE_URL is defined
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is not defined");
    process.exit(1);
  }

  // MongoDB connection
  const client = new MongoClient(databaseUrl);
  await client.connect();
  const db = client.db();

  // Create default admin user
  const adminEmail = "admin@ebunker.com";
  const adminPassword = "admin123";
  
  // Check if admin already exists
  const existingAdmin = await db.collection("admins").findOne({ email: adminEmail });
  
  if (!existingAdmin) {
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    // Create the admin user
    const result = await db.collection("admins").insertOne({
      email: adminEmail,
      hashedPassword,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log("Default admin user created:");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword} (change this in production!)`);
  } else {
    console.log("Admin user already exists");
  }
  
  await client.close();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });