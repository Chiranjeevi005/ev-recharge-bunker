/**
 * Simple test file to verify our timeout and transaction utilities
 */

import { connectToDatabase } from './lib/db/connection';
import { executeTransaction } from './lib/db/transaction';
import { fetchWithTimeout } from './utils/fetchWithTimeout';
import { vercelTimeoutGuard } from './utils/vercelTimeoutGuard';

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  try {
    const { client, db } = await connectToDatabase();
    console.log('✓ Database connection successful');
    
    // Test a simple query
    const collections = await db.listCollections().toArray();
    console.log(`✓ Found ${collections.length} collections`);
    
    // Test transaction
    console.log('Testing transaction...');
    const result = await executeTransaction(async (session) => {
      // This is just a test - we're not actually modifying data
      console.log('✓ Transaction executed successfully');
      return { success: true, message: 'Transaction test passed' };
    });
    
    console.log('Transaction result:', result);
    return true;
  } catch (error) {
    console.error('✗ Database test failed:', error);
    return false;
  }
}

async function testFetchWithTimeout() {
  console.log('Testing fetch with timeout...');
  try {
    // Test with a fast endpoint
    const response = await fetchWithTimeout('https://httpbin.org/get', { timeout: 5000 });
    console.log('✓ Fetch with timeout successful:', response.status);
    return true;
  } catch (error) {
    console.error('✗ Fetch test failed:', error);
    return false;
  }
}

function testTimeoutGuard() {
  console.log('Testing Vercel timeout guard...');
  try {
    const cleanup = vercelTimeoutGuard(1000, () => {
      console.log('✓ Timeout guard triggered successfully');
    });
    
    // Clean up immediately for this test
    cleanup();
    console.log('✓ Timeout guard cleanup successful');
    return true;
  } catch (error) {
    console.error('✗ Timeout guard test failed:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('Running all utility tests...\n');
  
  const tests = [
    { name: 'Database Connection', test: testDatabaseConnection },
    { name: 'Fetch with Timeout', test: testFetchWithTimeout },
    { name: 'Vercel Timeout Guard', test: testTimeoutGuard }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const { name, test } of tests) {
    try {
      console.log(`\n--- Testing ${name} ---`);
      const result = await test();
      if (result) {
        passed++;
        console.log(`✓ ${name} passed`);
      } else {
        failed++;
        console.log(`✗ ${name} failed`);
      }
    } catch (error) {
      failed++;
      console.log(`✗ ${name} failed with error:`, error);
    }
  }
  
  console.log('\n--- Test Results ---');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${tests.length}`);
  
  return failed === 0;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runAllTests };