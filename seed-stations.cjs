const { MongoClient } = require('mongodb');
require('dotenv').config();

// Demo data for stations
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

async function seedStations() {
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
    
    // Clear existing stations data
    await db.collection("stations").deleteMany({});
    
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
        
        const result = await db.collection("stations").insertOne(stationData);
        console.log(`Created station: ${station.name} with ID: ${result.insertedId}`);
      }
    }
    
    // Close the connection
    await client.close();
    
    console.log("Stations seeded successfully!");
  } catch (error) {
    console.error("Error seeding stations:", error);
    process.exit(1);
  }
}

// Run the seed function
seedStations().then(() => {
  console.log("Station seeding completed");
  process.exit(0);
}).catch((error) => {
  console.error("Station seeding failed:", error);
  process.exit(1);
});