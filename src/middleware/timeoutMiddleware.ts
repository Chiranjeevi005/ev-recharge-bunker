import { vercelTimeoutGuard } from '../utils/vercelTimeoutGuard';

/**
 * Express/Node.js middleware for handling request timeouts
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function timeoutMiddleware(req: any, res: any, next: () => void): void {
  // Set up timeout guard (55 seconds to stay under Vercel's 60s limit)
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