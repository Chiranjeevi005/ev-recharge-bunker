import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initSocket } from '../src/lib/realtime/socket';
import { startup } from '../src/lib/startup';
import { initRealTimeFeatures } from '../src/lib/realtime/initRealTime';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 3002;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      // Set timeout for the request (60 seconds)
      req.setTimeout(60000);
      res.setTimeout(60000);
      
      // Add keep-alive settings
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Keep-Alive', 'timeout=60');
      
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const url = req.url || '/';
      const parsedUrl = parse(url, true);
      
      // Add timeout to the request handling
      const requestPromise = handle(req, res, parsedUrl);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 60 seconds')), 60000);
      });
      
      await Promise.race([requestPromise, timeoutPromise]);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end('internal server error');
      }
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });

  // Set server timeout (60 seconds)
  server.setTimeout(60000);
  
  // Set keep-alive timeout
  server.keepAliveTimeout = 65000; // 65 seconds
  server.headersTimeout = 66000; // 66 seconds

  // Initialize Socket.IO
  initSocket(server);
  
  // Initialize application services
  startup().catch(console.error);
  
  // Initialize real-time features
  initRealTimeFeatures().catch(console.error);

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });
});