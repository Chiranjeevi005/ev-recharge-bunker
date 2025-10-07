import { connectToDatabase } from '@/lib/db/connection';
import type { Db } from 'mongodb';
// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

interface Slot {
  slotId: string;
  status: "available" | "occupied" | "maintenance";
  chargerType: string;
  pricePerHour: number;
}

interface Station {
  city: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  slots: Slot[];
}

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
          { slotId: "delhi-1-1", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 50 },
          { slotId: "delhi-1-2", status: "available" as const, chargerType: "DC CHAdeMO", pricePerHour: 60 },
          { slotId: "delhi-1-3", status: "occupied" as const, chargerType: "DC CCS", pricePerHour: 70 },
          { slotId: "delhi-1-4", status: "available" as const, chargerType: "AC Type 1", pricePerHour: 45 },
        ]
      },
      {
        name: "Connaught Place Hub",
        address: "Connaught Place, New Delhi",
        lat: 28.6333,
        lng: 77.2167,
        slots: [
          { slotId: "delhi-2-1", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 50 },
          { slotId: "delhi-2-2", status: "maintenance" as const, chargerType: "DC CHAdeMO", pricePerHour: 60 },
          { slotId: "delhi-2-3", status: "available" as const, chargerType: "DC CCS", pricePerHour: 70 },
        ]
      },
      {
        name: "South Delhi Complex",
        address: "Hauz Khas, New Delhi",
        lat: 28.5542,
        lng: 77.1898,
        slots: [
          { slotId: "delhi-3-1", status: "available" as const, chargerType: "AC Type 1", pricePerHour: 45 },
          { slotId: "delhi-3-2", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 50 },
          { slotId: "delhi-3-3", status: "occupied" as const, chargerType: "DC CCS", pricePerHour: 70 },
          { slotId: "delhi-3-4", status: "available" as const, chargerType: "DC CHAdeMO", pricePerHour: 60 },
        ]
      },
      {
        name: "East Delhi Mall",
        address: "Welcome Metro Station, East Delhi",
        lat: 28.6726,
        lng: 77.2818,
        slots: [
          { slotId: "delhi-4-1", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 50 },
          { slotId: "delhi-4-2", status: "available" as const, chargerType: "DC CCS", pricePerHour: 70 },
        ]
      },
      {
        name: "North Delhi Center",
        address: "Kashmere Gate, North Delhi",
        lat: 28.6675,
        lng: 77.2254,
        slots: [
          { slotId: "delhi-5-1", status: "available" as const, chargerType: "AC Type 1", pricePerHour: 45 },
          { slotId: "delhi-5-2", status: "occupied" as const, chargerType: "DC CHAdeMO", pricePerHour: 60 },
          { slotId: "delhi-5-3", status: "available" as const, chargerType: "DC CCS", pricePerHour: 70 },
          { slotId: "delhi-5-4", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 50 },
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
          { slotId: "mumbai-1-1", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 55 },
          { slotId: "mumbai-1-2", status: "available" as const, chargerType: "DC CCS", pricePerHour: 75 },
          { slotId: "mumbai-1-3", status: "occupied" as const, chargerType: "DC CHAdeMO", pricePerHour: 65 },
        ]
      },
      {
        name: "Bandra Kurla Complex",
        address: "BKC, Mumbai",
        lat: 19.0676,
        lng: 72.8642,
        slots: [
          { slotId: "mumbai-2-1", status: "available" as const, chargerType: "AC Type 1", pricePerHour: 50 },
          { slotId: "mumbai-2-2", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 55 },
          { slotId: "mumbai-2-3", status: "maintenance" as const, chargerType: "DC CCS", pricePerHour: 75 },
        ]
      },
      {
        name: "Powai Hub",
        address: "IIT Bombay, Powai, Mumbai",
        lat: 19.1310,
        lng: 72.9136,
        slots: [
          { slotId: "mumbai-3-1", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 55 },
          { slotId: "mumbai-3-2", status: "available" as const, chargerType: "DC CHAdeMO", pricePerHour: 65 },
          { slotId: "mumbai-3-3", status: "available" as const, chargerType: "DC CCS", pricePerHour: 75 },
        ]
      },
      {
        name: "Marine Lines Station",
        address: "Marine Lines, Mumbai",
        lat: 18.9436,
        lng: 72.8202,
        slots: [
          { slotId: "mumbai-4-1", status: "available" as const, chargerType: "AC Type 1", pricePerHour: 50 },
          { slotId: "mumbai-4-2", status: "occupied" as const, chargerType: "AC Type 2", pricePerHour: 55 },
        ]
      },
      {
        name: "Andheri West Point",
        address: "Andheri West, Mumbai",
        lat: 19.1200,
        lng: 72.8480,
        slots: [
          { slotId: "mumbai-5-1", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 55 },
          { slotId: "mumbai-5-2", status: "available" as const, chargerType: "DC CCS", pricePerHour: 75 },
          { slotId: "mumbai-5-3", status: "available" as const, chargerType: "DC CHAdeMO", pricePerHour: 65 },
        ]
      }
    ]
  },
  {
    name: "Kolkata",
    stations: [
      {
        name: "Kolkata Metro Station",
        address: "Park Street, Kolkata",
        lat: 22.5546,
        lng: 88.3508,
        slots: [
          { slotId: "kolkata-1-1", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 48 },
          { slotId: "kolkata-1-2", status: "available" as const, chargerType: "DC CCS", pricePerHour: 68 },
        ]
      },
      {
        name: "Salt Lake Hub",
        address: "Salt Lake City, Kolkata",
        lat: 22.5800,
        lng: 88.4100,
        slots: [
          { slotId: "kolkata-2-1", status: "available" as const, chargerType: "AC Type 1", pricePerHour: 43 },
          { slotId: "kolkata-2-2", status: "occupied" as const, chargerType: "AC Type 2", pricePerHour: 48 },
          { slotId: "kolkata-2-3", status: "available" as const, chargerType: "DC CHAdeMO", pricePerHour: 58 },
        ]
      },
      {
        name: "Howrah Station",
        address: "Howrah, Kolkata",
        lat: 22.5850,
        lng: 88.3080,
        slots: [
          { slotId: "kolkata-3-1", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 48 },
          { slotId: "kolkata-3-2", status: "available" as const, chargerType: "DC CCS", pricePerHour: 68 },
        ]
      },
      {
        name: "Gariahat Market",
        address: "Gariahat, Kolkata",
        lat: 22.5200,
        lng: 88.3600,
        slots: [
          { slotId: "kolkata-4-1", status: "available" as const, chargerType: "AC Type 1", pricePerHour: 43 },
          { slotId: "kolkata-4-2", status: "maintenance" as const, chargerType: "AC Type 2", pricePerHour: 48 },
        ]
      },
      {
        name: "Dum Dum Point",
        address: "Dum Dum, Kolkata",
        lat: 22.5800,
        lng: 88.3600,
        slots: [
          { slotId: "kolkata-5-1", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 48 },
          { slotId: "kolkata-5-2", status: "available" as const, chargerType: "DC CHAdeMO", pricePerHour: 58 },
        ]
      }
    ]
  },
  {
    name: "Chennai",
    stations: [
      {
        name: "Chennai Central",
        address: "Chennai Central, Chennai",
        lat: 13.0833,
        lng: 80.2833,
        slots: [
          { slotId: "chennai-1-1", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 52 },
          { slotId: "chennai-1-2", status: "occupied" as const, chargerType: "DC CCS", pricePerHour: 72 },
        ]
      },
      {
        name: "T Nagar Hub",
        address: "T Nagar, Chennai",
        lat: 13.0333,
        lng: 80.2333,
        slots: [
          { slotId: "chennai-2-1", status: "available" as const, chargerType: "AC Type 1", pricePerHour: 47 },
          { slotId: "chennai-2-2", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 52 },
        ]
      },
      {
        name: "Anna University",
        address: "Guindy, Chennai",
        lat: 13.0100,
        lng: 80.2300,
        slots: [
          { slotId: "chennai-3-1", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 52 },
          { slotId: "chennai-3-2", status: "available" as const, chargerType: "DC CHAdeMO", pricePerHour: 62 },
        ]
      },
      {
        name: "Egmore Station",
        address: "Egmore, Chennai",
        lat: 13.0700,
        lng: 80.2500,
        slots: [
          { slotId: "chennai-4-1", status: "available" as const, chargerType: "AC Type 1", pricePerHour: 47 },
          { slotId: "chennai-4-2", status: "maintenance" as const, chargerType: "AC Type 2", pricePerHour: 52 },
        ]
      },
      {
        name: "Velachery Point",
        address: "Velachery, Chennai",
        lat: 12.9800,
        lng: 80.2200,
        slots: [
          { slotId: "chennai-5-1", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 52 },
          { slotId: "chennai-5-2", status: "available" as const, chargerType: "DC CCS", pricePerHour: 72 },
        ]
      }
    ]
  },
  {
    name: "Bengaluru",
    stations: [
      {
        name: "Bangalore Metro",
        address: "MG Road, Bengaluru",
        lat: 12.9750,
        lng: 77.5950,
        slots: [
          { slotId: "bengaluru-1-1", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 53 },
          { slotId: "bengaluru-1-2", status: "available" as const, chargerType: "DC CCS", pricePerHour: 73 },
        ]
      },
      {
        name: "Koramangala Hub",
        address: "Koramangala, Bengaluru",
        lat: 12.9350,
        lng: 77.6250,
        slots: [
          { slotId: "bengaluru-2-1", status: "available" as const, chargerType: "AC Type 1", pricePerHour: 48 },
          { slotId: "bengaluru-2-2", status: "occupied" as const, chargerType: "AC Type 2", pricePerHour: 53 },
        ]
      },
      {
        name: "Whitefield Complex",
        address: "Whitefield, Bengaluru",
        lat: 12.9700,
        lng: 77.7100,
        slots: [
          { slotId: "bengaluru-3-1", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 53 },
          { slotId: "bengaluru-3-2", status: "available" as const, chargerType: "DC CHAdeMO", pricePerHour: 63 },
        ]
      },
      {
        name: "Indiranagar Station",
        address: "Indiranagar, Bengaluru",
        lat: 12.9750,
        lng: 77.6400,
        slots: [
          { slotId: "bengaluru-4-1", status: "available" as const, chargerType: "AC Type 1", pricePerHour: 48 },
          { slotId: "bengaluru-4-2", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 53 },
        ]
      },
      {
        name: "Electronic City",
        address: "Electronic City, Bengaluru",
        lat: 12.8400,
        lng: 77.6500,
        slots: [
          { slotId: "bengaluru-5-1", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 53 },
          { slotId: "bengaluru-5-2", status: "maintenance" as const, chargerType: "DC CCS", pricePerHour: 73 },
        ]
      }
    ]
  },
  {
    name: "Hyderabad",
    stations: [
      {
        name: "Hyderabad Metro Rail",
        address: "Hitech City, Hyderabad",
        lat: 17.4500,
        lng: 78.3800,
        slots: [
          { slotId: "hyderabad-1-1", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 51 },
          { slotId: "hyderabad-1-2", status: "available" as const, chargerType: "DC CCS", pricePerHour: 71 },
        ]
      },
      {
        name: "Banjara Hills Hub",
        address: "Banjara Hills, Hyderabad",
        lat: 17.4100,
        lng: 78.4300,
        slots: [
          { slotId: "hyderabad-2-1", status: "available" as const, chargerType: "AC Type 1", pricePerHour: 46 },
          { slotId: "hyderabad-2-2", status: "occupied" as const, chargerType: "AC Type 2", pricePerHour: 51 },
        ]
      },
      {
        name: "Gachibowli Complex",
        address: "Gachibowli, Hyderabad",
        lat: 17.4400,
        lng: 78.3500,
        slots: [
          { slotId: "hyderabad-3-1", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 51 },
          { slotId: "hyderabad-3-2", status: "available" as const, chargerType: "DC CHAdeMO", pricePerHour: 61 },
        ]
      },
      {
        name: "Secunderabad Station",
        address: "Secunderabad, Hyderabad",
        lat: 17.4300,
        lng: 78.5000,
        slots: [
          { slotId: "hyderabad-4-1", status: "available" as const, chargerType: "AC Type 1", pricePerHour: 46 },
          { slotId: "hyderabad-4-2", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 51 },
        ]
      },
      {
        name: "Kondapur Point",
        address: "Kondapur, Hyderabad",
        lat: 17.4700,
        lng: 78.3800,
        slots: [
          { slotId: "hyderabad-5-1", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 51 },
          { slotId: "hyderabad-5-2", status: "available" as const, chargerType: "DC CCS", pricePerHour: 71 },
        ]
      }
    ]
  },
  {
    name: "Ahmedabad",
    stations: [
      {
        name: "Ahmedabad Metro",
        address: "Ashram Road, Ahmedabad",
        lat: 23.0200,
        lng: 72.5800,
        slots: [
          { slotId: "ahmedabad-1-1", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 49 },
          { slotId: "ahmedabad-1-2", status: "maintenance" as const, chargerType: "DC CCS", pricePerHour: 69 },
        ]
      },
      {
        name: "CG Road Hub",
        address: "CG Road, Ahmedabad",
        lat: 23.0300,
        lng: 72.5600,
        slots: [
          { slotId: "ahmedabad-2-1", status: "available" as const, chargerType: "AC Type 1", pricePerHour: 44 },
          { slotId: "ahmedabad-2-2", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 49 },
        ]
      },
      {
        name: "Vastrapur Complex",
        address: "Vastrapur, Ahmedabad",
        lat: 23.0500,
        lng: 72.5300,
        slots: [
          { slotId: "ahmedabad-3-1", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 49 },
          { slotId: "ahmedabad-3-2", status: "occupied" as const, chargerType: "DC CHAdeMO", pricePerHour: 59 },
        ]
      },
      {
        name: "Navrangpura Station",
        address: "Navrangpura, Ahmedabad",
        lat: 23.0300,
        lng: 72.5800,
        slots: [
          { slotId: "ahmedabad-4-1", status: "available" as const, chargerType: "AC Type 1", pricePerHour: 44 },
          { slotId: "ahmedabad-4-2", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 49 },
        ]
      },
      {
        name: "Sarkhej Point",
        address: "Sarkhej, Ahmedabad",
        lat: 22.9900,
        lng: 72.5300,
        slots: [
          { slotId: "ahmedabad-5-1", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 49 },
          { slotId: "ahmedabad-5-2", status: "available" as const, chargerType: "DC CCS", pricePerHour: 69 },
        ]
      }
    ]
  },
  {
    name: "Pune",
    stations: [
      {
        name: "Pune Railway Station",
        address: "Pune Railway Station, Pune",
        lat: 18.5300,
        lng: 73.8700,
        slots: [
          { slotId: "pune-1-1", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 54 },
          { slotId: "pune-1-2", status: "available" as const, chargerType: "DC CCS", pricePerHour: 74 },
        ]
      },
      {
        name: "Koregaon Park Hub",
        address: "Koregaon Park, Pune",
        lat: 18.5400,
        lng: 73.8900,
        slots: [
          { slotId: "pune-2-1", status: "available" as const, chargerType: "AC Type 1", pricePerHour: 49 },
          { slotId: "pune-2-2", status: "occupied" as const, chargerType: "AC Type 2", pricePerHour: 54 },
        ]
      },
      {
        name: "Hinjewadi Complex",
        address: "Hinjewadi, Pune",
        lat: 18.5900,
        lng: 73.7400,
        slots: [
          { slotId: "pune-3-1", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 54 },
          { slotId: "pune-3-2", status: "available" as const, chargerType: "DC CHAdeMO", pricePerHour: 64 },
        ]
      },
      {
        name: "Baner Station",
        address: "Baner, Pune",
        lat: 18.5600,
        lng: 73.7700,
        slots: [
          { slotId: "pune-4-1", status: "available" as const, chargerType: "AC Type 1", pricePerHour: 49 },
          { slotId: "pune-4-2", status: "maintenance" as const, chargerType: "AC Type 2", pricePerHour: 54 },
        ]
      },
      {
        name: "Hadapsar Point",
        address: "Hadapsar, Pune",
        lat: 18.5100,
        lng: 73.9300,
        slots: [
          { slotId: "pune-5-1", status: "available" as const, chargerType: "AC Type 2", pricePerHour: 54 },
          { slotId: "pune-5-2", status: "available" as const, chargerType: "DC CCS", pricePerHour: 74 },
        ]
      }
    ]
  }
];

export async function seedDatabase() {
  try {
    const { db } = await connectToDatabase();
    const typedDb = db as Db;
    
    // Clear existing data
    await db.collection("stations").deleteMany({});
    await db.collection("bookings").deleteMany({});
    await db.collection("payments").deleteMany({});
    
    // Insert stations for each metro city
    for (const city of metroCities) {
      for (const station of city.stations) {
        const stationData: Station = {
          city: city.name,
          name: station.name,
          address: station.address,
          lat: station.lat,
          lng: station.lng,
          slots: station.slots
        };
        
        await typedDb.collection<Station>("stations").insertOne(stationData);
      }
    }
    
    console.log("Database seeded successfully with demo data for 8 metro cities!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run the seed function
seedDatabase();