/**
 * Utility functions for handling timeouts in API routes
 */

/**
 * Wraps a promise with a timeout
 * @param promise The promise to wrap
 * @param ms The timeout in milliseconds
 * @returns A promise that rejects if the timeout is exceeded
 */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]) as Promise<T>;
}

/**
 * Creates a timeout promise
 * @param ms The timeout in milliseconds
 * @returns A promise that rejects after the specified time
 */
export function createTimeout(ms: number): Promise<never> {
  return new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms)
  );
}

/**
 * Executes a function with a timeout
 * @param fn The function to execute
 * @param ms The timeout in milliseconds
 * @returns The result of the function or throws a timeout error
 */
export async function executeWithTimeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  const timeoutPromise = createTimeout(ms);
  const resultPromise = fn();
  return Promise.race([resultPromise, timeoutPromise]);
}

/**
 * Wraps an API route handler with timeout protection
 * @param handler The route handler function
 * @param timeoutMs The timeout in milliseconds (default: 15000)
 * @returns A wrapped handler with timeout protection
 */
export function withApiTimeout<T>(
  handler: (request: Request) => Promise<T>,
  timeoutMs: number = 15000
): (request: Request) => Promise<T> {
  return async (request: Request) => {
    const timeoutPromise = createTimeout(timeoutMs);
    const handlerPromise = handler(request);
    return Promise.race([handlerPromise, timeoutPromise]);
  };
}