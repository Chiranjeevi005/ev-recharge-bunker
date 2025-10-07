import { exec } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Read the .env.local file
const envContent = fs.readFileSync('.env.local', 'utf8');
const lines = envContent.split('\n');

// Extract environment variables
const envVars = {};
lines.forEach(line => {
  if (line && !line.startsWith('#') && line.includes('=')) {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  }
});

// Set environment variables in Vercel
const envVarNames = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'REDIS_URL',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'NEXT_PUBLIC_RAZORPAY_KEY_ID',
  'ARCJET_KEY',
  'NODE_ENV'
];

console.log('Setting environment variables in Vercel...');

// Function to set environment variable
async function setEnvVar(name, value) {
  try {
    const command = `echo ${value} | vercel env add ${name} production`;
    console.log(`Setting ${name}...`);
    const { stdout, stderr } = await execPromise(command);
    console.log(`Successfully set ${name}`);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    console.error(`Error setting ${name}:`, error);
    throw error;
  }
}

// Set all environment variables
async function setAllEnvVars() {
  try {
    for (const name of envVarNames) {
      if (envVars[name]) {
        await setEnvVar(name, envVars[name]);
      } else {
        console.log(`Skipping ${name} - not found in .env.local`);
      }
    }
    console.log('All environment variables set successfully!');
  } catch (error) {
    console.error('Error setting environment variables:', error);
  }
}

setAllEnvVars();