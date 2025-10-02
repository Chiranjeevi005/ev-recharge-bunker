# Redis Setup Guide for EV Bunker

## Overview

Redis is a critical component for the EV Bunker application, providing real-time features including:
- Charging session tracking
- Payment status updates
- Slot availability caching
- Real-time UI updates

## Installation Steps

### 1. Automatic Installation (Recommended)

The Redis server has been automatically downloaded and set up in the `redis/` directory:

```
redis/
├── Redis-x64-5.0.14.1/    # Redis server installation
│   ├── redis-server.exe    # Redis server executable
│   ├── redis-cli.exe       # Redis command-line interface
│   └── ...                 # Other Redis files
└── Redis-x64-5.0.14.1.zip # Redis installation archive
```

### 2. Manual Installation (Alternative)

If you need to reinstall Redis:

1. Download Redis for Windows from: https://github.com/tporadowski/redis/releases
2. Extract to the `redis/` directory
3. Run `redis-server.exe` to start the server

## Starting Redis

### Option 1: Using the Batch Script
Double-click on `redis/start-redis.bat` to start the Redis server.

### Option 2: Command Line
```bash
cd redis/Redis-x64-5.0.14.1
redis-server.exe
```

### Option 3: Background Process
```bash
cd redis/Redis-x64-5.0.14.1
redis-server.exe --daemonize yes
```

## Testing Redis Connection

### Using the Test Script
Double-click on `redis/test-redis.bat` to test the Redis connection.

### Using Command Line
```bash
cd redis/Redis-x64-5.0.14.1
redis-cli.exe ping
```

Expected output: `PONG`

## Configuration

Redis is configured to run on the default port `6379` with default settings, which is suitable for development.

## Integration with EV Bunker

The application automatically connects to Redis using the `REDIS_URL` environment variable set in `.env.local`:

```
REDIS_URL=redis://localhost:6379
```

## Real-time Features

Redis enables the following real-time features in EV Bunker:

1. **Charging Session Tracking**
   - Key: `charging:session:{userId}`
   - Updates UI every 2 seconds with session status

2. **Payment Status Updates**
   - Key: `payment:status:{userId}`
   - Real-time payment confirmation

3. **Slot Availability Caching**
   - Key: `station:{city}:{id}:availability`
   - Fast retrieval of slot status

4. **Pub/Sub Messaging**
   - Channel: `charging-session-update`
   - Real-time notifications across clients

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Error: "Address already in use"
   - Solution: Stop existing Redis process or change port in configuration

2. **Permission Denied**
   - Error: "Permission denied"
   - Solution: Run as administrator or check file permissions

3. **Connection Refused**
   - Error: "Could not connect to Redis"
   - Solution: Ensure Redis server is running

### Checking if Redis is Running

```bash
tasklist | findstr redis
```

### Stopping Redis

If Redis is running as a background process:
```bash
redis-cli.exe shutdown
```

Or kill the process manually:
```bash
taskkill /IM redis-server.exe /F
```

## Performance Considerations

- Redis is configured for development with default settings
- For production, consider tuning memory limits and persistence settings
- Monitor memory usage as real-time data accumulates

## Security Notes

- Default Redis configuration has no password (suitable for development only)
- In production, configure authentication and network restrictions
- Never expose Redis directly to the internet

## Maintenance

Regular maintenance tasks:
1. Monitor memory usage with `INFO memory`
2. Check connected clients with `INFO clients`
3. Review slow queries with `SLOWLOG GET`

## Backup and Recovery

For development:
- No backup needed as data is ephemeral

For production:
- Enable RDB or AOF persistence
- Schedule regular backups
- Test recovery procedures

## References

- Redis Documentation: https://redis.io/documentation
- Redis CLI Commands: https://redis.io/commands
- Windows Redis Port: https://github.com/tporadowski/redis