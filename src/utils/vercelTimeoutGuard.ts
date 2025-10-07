/**
 * Vercel timeout guard to gracefully exit before hitting Vercel's hard limit
 * @param timeoutMs - Timeout in milliseconds (default: 55000ms for Vercel's 60s limit)
 * @param onTimeout - Function to call when timeout is reached
 * @returns Cleanup function to clear the timeout
 */
export function vercelTimeoutGuard(
  timeoutMs: number = 55000, // Default to 55 seconds (5s before Vercel's 60s limit)
  onTimeout?: () => void
): () => void {
  // Set up timeout to trigger before Vercel's hard limit
  const timeoutId = setTimeout(() => {
    console.warn(`[Vercel Timeout Guard] Function approaching execution timeout (${timeoutMs}ms)`);
    
    // Call the timeout handler if provided
    if (onTimeout) {
      try {
        onTimeout();
      } catch (error) {
        console.error('[Vercel Timeout Guard] Error in onTimeout handler:', error);
      }
    }
    
    // TODO: Add monitoring integration here (e.g., Sentry)
    // Example: Sentry.captureMessage('Function approaching timeout limit');
  }, timeoutMs);
  
  // Return cleanup function
  return () => {
    clearTimeout(timeoutId);
  };
}

/**
 * Express/Next.js middleware for timeout handling
 * @param req - Request object
 * @param res - Response object
 * @param next - Next function
 */
export function timeoutMiddleware(req: any, res: any, next: () => void): void {
  // Set up timeout guard
  const cleanup = vercelTimeoutGuard(55000, () => {
    // If we haven't already sent a response, send a timeout response
    if (!res.headersSent) {
      res.status(504).json({ 
        error: 'Gateway Timeout', 
        message: 'The server was unable to respond within the time limit' 
      });
    }
  });
  
  // Clean up timeout when response is finished
  res.on('finish', cleanup);
  res.on('close', cleanup);
  
  next();
}