// Test script to check client login with proper credentials
const http = require('http');
const https = require('https');

// First, get the CSRF token
const csrfOptions = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/auth/csrf',
  method: 'GET'
};

console.log('Getting CSRF token...');

const csrfReq = http.request(csrfOptions, (res) => {
  let csrfData = '';
  
  res.on('data', (chunk) => {
    csrfData += chunk;
  });
  
  res.on('end', () => {
    try {
      const csrfResponse = JSON.parse(csrfData);
      const csrfToken = csrfResponse.csrfToken;
      console.log('CSRF Token:', csrfToken);
      
      // Now test the login with proper credentials
      testLogin(csrfToken);
    } catch (error) {
      console.error('Error parsing CSRF response:', error);
    }
  });
});

csrfReq.on('error', (e) => {
  console.error(`Problem with CSRF request: ${e.message}`);
});

csrfReq.end();

function testLogin(csrfToken) {
  // Test data - using the credentials we know exist
  const postData = JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
    csrfToken: csrfToken,
    callbackUrl: '/'
  });

  console.log('Testing login with credentials...');
  
  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/auth/callback/client-credentials',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Login Status: ${res.statusCode}`);
    console.log(`Login Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`Login Response Body: ${data}`);
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with login request: ${e.message}`);
  });

  req.write(postData);
  req.end();
}