/**
 * Utility functions for API calls with better timeout and error handling
 */

/**
 * Fetch with timeout
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param timeout - Timeout in milliseconds (default: 15000)
 * @returns Promise with fetch response
 */
export async function fetchWithTimeout(
  url: string, 
  options: RequestInit = {}, 
  timeout: number = 15000
): Promise<Response> {
  // Create fetch promise
  const fetchPromise = fetch(url, options);
  
  // Create timeout promise
  const timeoutPromise = new Promise<Response>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timeout after ${timeout}ms`));
    }, timeout);
  });
  
  // Race between fetch and timeout
  return Promise.race([fetchPromise, timeoutPromise]);
}

/**
 * Fetch with retry logic
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param timeout - Timeout in milliseconds (default: 15000)
 * @returns Promise with fetch response
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  timeout: number = 15000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetchWithTimeout(url, options, timeout);
      return response;
    } catch (error) {
      lastError = error as Error;
      
      // If this is the last retry, throw the error
      if (i === maxRetries) {
        throw new Error(`Failed after ${maxRetries} retries: ${lastError.message}`);
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s, etc.
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error(`Failed after ${maxRetries} retries: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Fetch with comprehensive error handling
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param timeout - Timeout in milliseconds (default: 15000)
 * @param maxRetries - Maximum number of retries (default: 3)
 * @returns Promise with fetch response or error object
 */
export async function fetchWithErrorHandling(
  url: string,
  options: RequestInit = {},
  timeout: number = 15000,
  maxRetries: number = 3
): Promise<{ response?: Response; error?: string }> {
  try {
    const response = await fetchWithRetry(url, options, maxRetries, timeout);
    return { response };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`API call failed for ${url}:`, errorMessage);
    return { error: errorMessage };
  }
}

export default {
  fetchWithTimeout,
  fetchWithRetry,
  fetchWithErrorHandling
};