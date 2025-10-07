/**
 * Fetches a resource with a timeout using AbortController
 * @param url - The URL to fetch
 * @param options - Fetch options including timeout
 * @returns Promise resolving to the fetch response
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = 15000, ...fetchOptions } = options; // Default 15 seconds
  
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
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    
    // Re-throw other errors
    throw error;
  } finally {
    // Clear timeout to prevent memory leaks
    clearTimeout(timeoutId);
  }
}

/**
 * Fetches JSON data with timeout
 * @param url - The URL to fetch
 * @param options - Fetch options including timeout
 * @returns Promise resolving to parsed JSON data
 */
export async function fetchJsonWithTimeout<T>(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<T> {
  const response = await fetchWithTimeout(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  try {
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Failed to parse JSON response');
  }
}