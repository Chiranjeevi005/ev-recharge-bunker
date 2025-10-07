// Production server startup script with proper environment configuration
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
if (fs.existsSync('.env.local')) {
  const envConfig = fs.readFileSync('.env.local', 'utf8');
  const envVars = envConfig.split('\n');
  
  envVars.forEach((line) => {
    if (line.trim() !== '' && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
      }
    }
  });
}

// Set default values if not present
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || '3002';

console.log('Starting production server with environment:');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`PORT: ${process.env.PORT}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`);
console.log(`NEXT_PUBLIC_RAZORPAY_KEY_ID: ${process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? 'SET' : 'NOT SET'}`);

// Start the standalone server
const server = spawn('node', ['.next/standalone/server.js'], {
  stdio: 'inherit',
  env: process.env
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.kill('SIGINT');
});