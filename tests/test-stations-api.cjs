import fetch from 'node-fetch';

async function testStationsAPI() {
  try {
    console.log('Testing stations API...');
    const response = await fetch('http://localhost:3000/api/stations');
    const data = await response.json();
    
    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', [...response.headers.entries()]);
    
    if (data.success) {
      console.log('Number of stations:', data.data.length);
      console.log('First station data:', JSON.stringify(data.data[0], null, 2));
      
      // Check if lat/lng are properly set
      if (data.data.length > 0) {
        const firstStation = data.data[0];
        console.log('First station lat:', firstStation.lat);
        console.log('First station lng:', firstStation.lng);
        console.log('Are coordinates valid numbers?', 
          typeof firstStation.lat === 'number' && 
          typeof firstStation.lng === 'number' &&
          !isNaN(firstStation.lat) && 
          !isNaN(firstStation.lng));
      }
    } else {
      console.log('API Error:', data.error);
    }
  } catch (error) {
    console.error('Error testing stations API:', error);
  }
}

testStationsAPI();