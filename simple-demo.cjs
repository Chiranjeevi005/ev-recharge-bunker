/**
 * Simple demonstration of timeout utilities without TypeScript compilation
 */

// Simple fetch with timeout implementation
async function fetchWithTimeout(url, options = {}) {
  const { timeout = 15000, ...fetchOptions } = options;
  
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    // Add signal to fetch options
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });
    
    return response;
  } catch (error) {
    // Check if it's a timeout error
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    
    // Re-throw other errors
    throw error;
  } finally {
    // Clear timeout to prevent memory leaks
    clearTimeout(timeoutId);
  }
}

// Simple timeout guard implementation
function vercelTimeoutGuard(timeoutMs = 55000, onTimeout) {
  // Set up timeout to trigger before Vercel's hard limit
  const timeoutId = setTimeout(() => {
    console.log(`[Vercel Timeout Guard] Function approaching execution timeout (${timeoutMs}ms)`);
    
    // Call the timeout handler if provided
    if (onTimeout) {
      try {
        onTimeout();
      } catch (error) {
        console.error('[Vercel Timeout Guard] Error in onTimeout handler:', error);
      }
    }
  }, timeoutMs);
  
  // Return cleanup function
  return () => {
    clearTimeout(timeoutId);
  };
}

async function demoFetchWithTimeout() {
  console.log('Demonstrating fetchWithTimeout utility...');
  
  try {
    // Test a fast endpoint
    console.log('Fetching https://httpbin.org/get with 5s timeout...');
    const response = await fetchWithTimeout('https://httpbin.org/get', { timeout: 5000 });
    console.log('✓ Success! Status:', response.status);
    
    // Parse JSON response
    const data = await response.json();
    console.log('✓ Response received, keys:', Object.keys(data));
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

function demoTimeoutGuard() {
  console.log('\nDemonstrating vercelTimeoutGuard utility...');
  
  try {
    // Create a timeout guard
    const cleanup = vercelTimeoutGuard(1000, () => {
      console.log('✓ Timeout handler executed successfully');
    });
    
    console.log('✓ Timeout guard created successfully');
    
    // Clean up after a short delay
    setTimeout(() => {
      cleanup();
      console.log('✓ Timeout guard cleaned up successfully');
    }, 500);
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

async function runDemo() {
  console.log('=== EV Bunker Utilities Demo ===\n');
  
  await demoFetchWithTimeout();
  demoTimeoutGuard();
  
  console.log('\n=== Demo Complete ===');
}

// Run demo if this file is executed directly
if (require.main === module) {
  runDemo().catch(console.error);
}

module.exports = { runDemo, fetchWithTimeout, vercelTimeoutGuard };