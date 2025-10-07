import http from 'http';
import https from 'https';
import { URL } from 'url';

/**
 * Load testing utilities for stress testing the application
 */

// Configuration interface
interface LoadTestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
  concurrency: number;
  requests: number;
  timeout?: number;
}

// Result interface
interface LoadTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  statusCodeCounts: Record<number, number>;
  errors: string[];
  startTime: Date;
  endTime: Date;
}

/**
 * Perform a single HTTP request
 * @param url - The URL to request
 * @param options - Request options
 * @returns Promise with response data
 */
function makeRequest(url: string, options: any): Promise<{ statusCode: number; responseTime: number }> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: options.timeout || 5000
    };
    
    const startTime = Date.now();
    
    const req = protocol.request(requestOptions, (res) => {
      res.on('data', () => {}); // Consume response data
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        resolve({
          statusCode: res.statusCode || 0,
          responseTime
        });
      });
    });
    
    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      reject({
        error: error.message,
        responseTime
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      const responseTime = Date.now() - startTime;
      reject({
        error: 'Request timeout',
        responseTime
      });
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

/**
 * Run a load test
 * @param config - Load test configuration
 * @returns Promise with test results
 */
export async function runLoadTest(config: LoadTestConfig): Promise<LoadTestResult> {
  const results: LoadTestResult = {
    totalRequests: config.requests,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    minResponseTime: Infinity,
    maxResponseTime: 0,
    statusCodeCounts: {},
    errors: [],
    startTime: new Date(),
    endTime: new Date()
  };
  
  const responseTimes: number[] = [];
  
  // Create an array of promises for concurrent requests
  const promises: Promise<void>[] = [];
  
  for (let i = 0; i < config.requests; i++) {
    const promise = makeRequest(config.url, {
      method: config.method,
      headers: config.headers,
      body: config.body,
      timeout: config.timeout
    }).then((result) => {
      results.successfulRequests++;
      responseTimes.push(result.responseTime);
      
      // Update min/max response times
      if (result.responseTime < results.minResponseTime) {
        results.minResponseTime = result.responseTime;
      }
      if (result.responseTime > results.maxResponseTime) {
        results.maxResponseTime = result.responseTime;
      }
      
      // Update status code counts
      const statusCode = result.statusCode;
      if (!results.statusCodeCounts[statusCode]) {
        results.statusCodeCounts[statusCode] = 0;
      }
      results.statusCodeCounts[statusCode]++;
    }).catch((error) => {
      results.failedRequests++;
      results.errors.push(error.error);
    });
    
    promises.push(promise);
    
    // Control concurrency
    if (promises.length >= config.concurrency) {
      await Promise.all(promises.splice(0, config.concurrency));
    }
  }
  
  // Wait for remaining promises
  await Promise.all(promises);
  
  // Calculate average response time
  if (responseTimes.length > 0) {
    const sum = responseTimes.reduce((a, b) => a + b, 0);
    results.averageResponseTime = sum / responseTimes.length;
  }
  
  // Set min response time to 0 if no successful requests
  if (results.minResponseTime === Infinity) {
    results.minResponseTime = 0;
  }
  
  results.endTime = new Date();
  
  return results;
}

/**
 * Run a stress test with increasing load
 * @param config - Base load test configuration
 * @param steps - Number of steps to increase load
 * @param stepMultiplier - Multiplier for each step
 * @returns Promise with test results for each step
 */
export async function runStressTest(
  config: LoadTestConfig,
  steps: number = 5,
  stepMultiplier: number = 2
): Promise<LoadTestResult[]> {
  const results: LoadTestResult[] = [];
  
  for (let i = 1; i <= steps; i++) {
    const stepConfig = {
      ...config,
      requests: config.requests * i,
      concurrency: Math.min(config.concurrency * i, config.requests * i)
    };
    
    console.log(`Running stress test step ${i}/${steps} with ${stepConfig.requests} requests...`);
    const result = await runLoadTest(stepConfig);
    results.push(result);
    
    // Log step results
    console.log(`Step ${i} completed:`);
    console.log(`  Successful: ${result.successfulRequests}/${result.totalRequests}`);
    console.log(`  Average response time: ${result.averageResponseTime.toFixed(2)}ms`);
    console.log(`  Status codes:`, result.statusCodeCounts);
    
    // Add a small delay between steps
    if (i < steps) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

export default {
  runLoadTest,
  runStressTest
};