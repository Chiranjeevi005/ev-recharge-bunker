const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function checkSpecificPayment() {
  const MONGODB_URI = process.env.DATABASE_URL;
  
  if (!MONGODB_URI) {
    console.error('DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('ev_bunker');
    
    // Check the specific payment with Mumbai Central Station
    const payment = await db.collection('payments').findOne({ amount: 900, status: 'completed' });
    console.log('Specific payment details:');
    console.log(JSON.stringify(payment, null, 2));
    
    // Check what station this ID corresponds to (try both as string and ObjectId)
    if (payment && payment.stationId) {
      console.log(`\nChecking station ID: ${payment.stationId}`);
      
      // Try as string
      let station = await db.collection('stations').findOne({ _id: payment.stationId });
      if (station) {
        console.log('Station found (as string):');
        console.log(JSON.stringify(station, null, 2));
      } else {
        console.log('Station not found as string');
        
        // Try as ObjectId
        try {
          station = await db.collection('stations').findOne({ _id: new ObjectId(payment.stationId) });
          if (station) {
            console.log('Station found (as ObjectId):');
            console.log(JSON.stringify(station, null, 2));
          } else {
            console.log('Station not found as ObjectId');
          }
        } catch (error) {
          console.log('Error trying as ObjectId:', error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('Error checking specific payment:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

checkSpecificPayment();