# Timeout Handling Guide

This document explains how timeouts are handled in the EV Bunker application and provides guidance for troubleshooting and optimizing timeout configurations.

## Timeout Configuration Overview

### Database Connections

The MongoDB connection in `src/lib/db/connection.ts` has the following timeout settings:

- `serverSelectionTimeoutMS`: 10000 (10 seconds) - Time to wait for server selection
- `connectTimeoutMS`: 10000 (10 seconds) - Time to wait for socket connection
- `socketTimeoutMS`: 20000 (20 seconds) - Time to wait for socket inactivity
- Connection promise timeout: 15000 (15 seconds) - Overall connection timeout
- Collections list timeout: 5000 (5 seconds) - Timeout for listing collections

### API Calls

API calls throughout the application use the following timeout strategies:

- Dashboard data fetching: 20000 (20 seconds) per endpoint
- Overall dashboard timeout: 30000 (30 seconds)
- General API utility timeouts: 15000 (15 seconds)

### Server Configuration

The server in `server.ts` has the following timeout settings:

- Request timeout: 60000 (60 seconds)
- Response timeout: 60000 (60 seconds)
- Server timeout: 60000 (60 seconds)

### Vercel Configuration

The `vercel.json` file sets:

- `maxDuration`: 60 (60 seconds) - Maximum execution duration for serverless functions

## Common Timeout Issues and Solutions

### 1. Database Connection Timeouts

**Symptoms:**
- "MongoDB connection timeout" errors
- "Database connection timeout" errors
- Slow application startup

**Solutions:**
1. Check MongoDB server status and connectivity
2. Verify `DATABASE_URL` in environment variables
3. Increase timeout values in `src/lib/db/connection.ts` if needed
4. Check network connectivity between application and database

### 2. API Request Timeouts

**Symptoms:**
- "Request timeout" errors in dashboard
- Slow loading of data in UI
- Incomplete data loading

**Solutions:**
1. Optimize database queries with proper indexing
2. Implement caching where appropriate
3. Increase timeout values in API calls
4. Use pagination for large data sets

### 3. Serverless Function Timeouts

**Symptoms:**
- "Timeout" errors in Vercel logs
- Functions terminating before completion
- Incomplete API responses

**Solutions:**
1. Optimize function code for performance
2. Increase `maxDuration` in `vercel.json` if needed
3. Break complex operations into smaller functions
4. Implement proper error handling and early returns

## Best Practices for Timeout Handling

### 1. Progressive Timeout Values

Set different timeout values for different operations:
- Fast operations: 5-10 seconds
- Medium operations: 10-30 seconds
- Long operations: 30-60 seconds

### 2. Graceful Degradation

Implement fallback mechanisms when timeouts occur:
- Return cached data when available
- Show partial data rather than error messages
- Provide user feedback about slow operations

### 3. Monitoring and Logging

- Log timeout events for analysis
- Monitor timeout frequency and patterns
- Set up alerts for excessive timeouts

### 4. User Experience

- Show loading indicators during long operations
- Provide clear error messages when timeouts occur
- Offer retry options for failed operations

## Troubleshooting Steps

### 1. Check Environment Variables

Verify that all required environment variables are set correctly, especially:
- `DATABASE_URL`
- `REDIS_URL`
- `NEXTAUTH_URL`

### 2. Test Database Connectivity

Run the debug API endpoints to verify database connectivity:
```
GET /api/debug/db
GET /api/debug/stations
```

### 3. Monitor Performance

Use the metrics endpoint to monitor application performance:
```
GET /api/metrics
GET /api/health-check
```

### 4. Review Logs

Check application logs for timeout-related errors:
- Database connection errors
- API timeout errors
- Server timeout errors

## Configuration Recommendations

### Development Environment

For local development, you may want to increase timeout values to accommodate slower hardware:
- Database timeouts: 15-30 seconds
- API timeouts: 30-60 seconds
- Server timeouts: 60-120 seconds

### Production Environment

For production deployments:
- Database timeouts: 10-20 seconds
- API timeouts: 15-30 seconds
- Server timeouts: 30-60 seconds

## Additional Resources

- [MongoDB Connection Options](https://mongodb.github.io/node-mongodb-native/4.0/interfaces/mongoclientoptions.html)
- [Next.js API Routes Documentation](https://nextjs.org/docs/api-routes/introduction)
- [Vercel Serverless Functions Documentation](https://vercel.com/docs/serverless-functions/introduction)