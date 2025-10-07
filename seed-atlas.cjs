// Seed MongoDB Atlas with demo data
const { MongoClient } = require('mongodb');

// Use the MongoDB Atlas URI from .env.local
const uri = 'mongodb+srv://chiru:chiru@cluster0.yylyjss.mongodb.net/ev_bunker?retryWrites=true&w=majority&appName=Cluster0';

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
      },
      {
        name: "Bandra Kurla Complex",
        address: "BKC, Mumbai",
        lat: 19.0676,
        lng: 72.8642,
        slots: [
          { slotId: "mumbai-2-1", status: "available", chargerType: "AC Type 1", pricePerHour: 50 },
          { slotId: "mumbai-2-2", status: "available", chargerType: "AC Type 2", pricePerHour: 55 },
          { slotId: "mumbai-2-3", status: "maintenance", chargerType: "DC CCS", pricePerHour: 75 },
        ]
      }
    ]
  }
];

async function seedDatabase() {
  let client;
  try {
    console.log('Seeding MongoDB Atlas database...');
    console.log('Using MongoDB Atlas URI:', uri.replace(/\/\/.*@/, '//***@')); // Hide credentials
    
    // Create MongoDB client
    client = new MongoClient(uri);
    
    // Connect to database
    await client.connect();
    console.log('Connected to MongoDB Atlas successfully');
    
    // Get database
    const db = client.db();
    console.log('Database name:', db.databaseName);
    
    // Clear existing data
    await db.collection("stations").deleteMany({});
    await db.collection("bookings").deleteMany({});
    await db.collection("payments").deleteMany({});
    console.log('Cleared existing data');
    
    // Insert stations for each metro city
    let totalStations = 0;
    for (const city of metroCities) {
      for (const station of city.stations) {
        const stationData = {
          city: city.name,
          name: station.name,
          address: station.address,
          lat: station.lat,
          lng: station.lng,
          slots: station.slots
        };
        
        await db.collection("stations").insertOne(stationData);
        totalStations++;
      }
    }
    
    console.log(`Database seeded successfully with ${totalStations} stations!`);
    
    // Verify data was inserted
    const stationsCount = await db.collection("stations").countDocuments();
    console.log('Stations count after seeding:', stationsCount);
    
    if (stationsCount > 0) {
      const sampleStations = await db.collection("stations").find().limit(5).toArray();
      console.log('Sample stations inserted:', sampleStations.map(s => s.name));
    }
  } catch (error) {
    console.error('Error seeding database:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

seedDatabase().then(() => {
  console.log("Seeding completed");
  process.exit(0);
}).catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});