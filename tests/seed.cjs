const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config();

// Demo data for 8 metro cities with accurate coordinates
const metroCities = [
  {
    name: "Delhi",
    stations: [
      {
        name: "Delhi Metro Station",
        address: "Rajiv Chowk, New Delhi",
        lat: 28.6328,
        lng: 77.2194,
        slots: [
          { slotId: "delhi-1-1", status: "available", chargerType: "AC Type 2", pricePerHour: 50 },
          { slotId: "delhi-1-2", status: "available", chargerType: "DC CHAdeMO", pricePerHour: 60 },
          { slotId: "delhi-1-3", status: "occupied", chargerType: "DC CCS", pricePerHour: 70 },
          { slotId: "delhi-1-4", status: "available", chargerType: "AC Type 1", pricePerHour: 45 },
        ]
      },
      {
        name: "Connaught Place Hub",
        address: "Connaught Place, New Delhi",
        lat: 28.6333,
        lng: 77.2167,
        slots: [
          { slotId: "delhi-2-1", status: "available", chargerType: "AC Type 2", pricePerHour: 50 },
          { slotId: "delhi-2-2", status: "maintenance", chargerType: "DC CHAdeMO", pricePerHour: 60 },
          { slotId: "delhi-2-3", status: "available", chargerType: "DC CCS", pricePerHour: 70 },
        ]
      }
    ]
  },
  {
    name: "Mumbai",
    stations: [
      {
        name: "Mumbai Central Station",
        address: "Mumbai Central, Mumbai",
        lat: 18.9693,
        lng: 72.8202,
        slots: [
          { slotId: "mumbai-1-1", status: "available", chargerType: "AC Type 2", pricePerHour: 55 },
          { slotId: "mumbai-1-2", status: "available", chargerType: "DC CCS", pricePerHour: 75 },
          { slotId: "mumbai-1-3", status: "occupied", chargerType: "DC CHAdeMO", pricePerHour: 65 },
        ]
      }
    ]
  }
];

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

async function seedDatabase() {
  try {
    // Dynamically import the connection module
    const { connectToDatabase } = await import('./src/lib/db/connection.ts');
    
    const { db } = await connectToDatabase();
    
    // Clear existing data
    await db.collection("stations").deleteMany({});
    await db.collection("clients").deleteMany({});
    await db.collection("bookings").deleteMany({});
    await db.collection("payments").deleteMany({});
    
    // Insert stations for each metro city
    for (const city of metroCities) {
      for (const station of city.stations) {
        const stationData = {
          city: city.name,
          name: station.name,
          address: station.address,
          lat: station.lat,
          lng: station.lng,
          slots: station.slots,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await db.collection("stations").insertOne(stationData);
      }
    }
    
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
        await db.collection("clients").insertOne(userData);
        console.log(`Created user: ${user.email}`);
      } else {
        console.log(`User already exists: ${user.email}`);
      }
    }
    
    console.log("Database seeded successfully with demo data!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run the seed function
seedDatabase().then(() => {
  console.log("Seeding completed");
  process.exit(0);
}).catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});