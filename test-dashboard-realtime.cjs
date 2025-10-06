const { MongoClient } = require('mongodb');

// Test if the dashboard displays real-time data by adding a client and checking the API
async function testDashboardRealTime() {
  try {
    console.log('Testing dashboard real-time data display...');
    
    // Connect to MongoDB
    const client = new MongoClient('mongodb://localhost:27017/ev_bunker');
    await client.connect();
    console.log('✅ MongoDB connected');
    
    const db = client.db();
    const clientsCollection = db.collection('clients');
    
    // Get initial client count
    const initialCount = await clientsCollection.countDocuments();
    console.log('Initial client count:', initialCount);
    
    // Insert a test client
    console.log('\n📝 Inserting test client...');
    const testClient = {
      name: 'Dashboard Test User',
      email: 'dashboard-test@example.com',
      role: 'user',
      status: 'active',
      createdAt: new Date()
    };
    
    const result = await clientsCollection.insertOne(testClient);
    console.log('✅ Test client inserted:', result.insertedId);
    
    // Wait a moment for any real-time updates
    console.log('\n⏳ Waiting for updates...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check the dashboard stats API
    console.log('\n📊 Checking dashboard stats API...');
    try {
      const statsResponse = await fetch('http://localhost:3002/api/dashboard/stats');
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        console.log('Dashboard stats:', JSON.stringify(stats, null, 2));
        
        // Look for the Users stat
        const usersStat = stats.find(stat => stat.name === 'Users');
        if (usersStat) {
          console.log('Users count from API:', usersStat.value);
          if (usersStat.value > initialCount) {
            console.log('✅ Dashboard stats updated correctly!');
          } else {
            console.log('⚠️ Dashboard stats may not have updated yet');
          }
        }
      } else {
        console.log('❌ Failed to fetch dashboard stats');
      }
    } catch (error) {
      console.log('❌ Error fetching dashboard stats:', error.message);
    }
    
    // Clean up - delete the test client
    await clientsCollection.deleteOne({ _id: result.insertedId });
    console.log('\n✅ Test client cleaned up');
    
    await client.close();
  } catch (error) {
    console.error('❌ Dashboard real-time test failed:', error.message);
  }
}

testDashboardRealTime().catch(console.error);