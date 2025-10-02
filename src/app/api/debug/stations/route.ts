import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';

export async function GET() {
  try {
    console.log('Debug API: Connecting to database');
    const { db } = await connectToDatabase();
    console.log('Debug API: Connected to database');
    
    // Check if stations collection exists
    const stationsCollection = db.collection('stations');
    
    // Count total stations
    const totalStations = await stationsCollection.countDocuments();
    console.log('Debug API: Total stations:', totalStations);
    
    // Get all unique cities
    const cities = await stationsCollection.distinct('city');
    console.log('Debug API: Available cities:', cities);
    
    // Check stations in each city
    const cityData: any[] = [];
    for (const city of cities) {
      const count = await stationsCollection.countDocuments({ city });
      console.log(`Debug API: Stations in ${city}:`, count);
      
      // Show sample stations
      const sampleStations = await stationsCollection.find({ city }).limit(2).toArray();
      console.log(`Debug API: Sample stations in ${city}:`, sampleStations.map(s => ({
        name: s.name,
        address: s.address,
        lat: s.lat,
        lng: s.lng
      })));
      
      cityData.push({
        city,
        count,
        sampleStations: sampleStations.map(s => ({
          name: s.name,
          address: s.address,
          lat: s.lat,
          lng: s.lng
        }))
      });
    }
    
    // Check clients collection
    const clientsCollection = db.collection('clients');
    const totalClients = await clientsCollection.countDocuments();
    console.log('Debug API: Total clients:', totalClients);
    
    // Show sample clients with their locations
    const sampleClients = await clientsCollection.find({}).limit(5).toArray();
    console.log('Debug API: Sample clients:', sampleClients.map(c => ({
      id: c._id,
      name: c.name,
      email: c.email,
      location: c.location
    })));
    
    const clientData = sampleClients.map(c => ({
      id: c._id,
      name: c.name,
      email: c.email,
      location: c.location
    }));
    
    return NextResponse.json({
      message: 'Database debug information',
      collections: ['stations', 'clients'],
      totalStations,
      cities: cityData,
      totalClients,
      sampleClients: clientData
    });
  } catch (error: any) {
    console.error('Debug API: Error checking stations:', error);
    return NextResponse.json({ error: 'Failed to check stations', details: error.message }, { status: 500 });
  }
}