import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initSocket } from './src/lib/realtime/socket';
import { startup } from './src/lib/startup';
import { initRealTimeFeatures } from './src/lib/realtime/initRealTime';

const dev = process.env['NODE_ENV'] !== 'production';
const hostname = 'localhost';
const port = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 3002;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const url = req.url || '/';
      const parsedUrl = parse(url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });

  // Initialize Socket.IO
  const io = initSocket(server);
  // Use io to prevent unused variable warning
  console.log('Socket.IO initialized');
  
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