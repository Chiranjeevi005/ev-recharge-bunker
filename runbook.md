# EV Bunker - Runbook
Date: 2025-10-07

## Overview
This runbook provides procedures for maintaining, deploying, and troubleshooting the EV Bunker application.

## Emergency Contacts
- Lead Developer: [To be filled]
- Database Administrator: [To be filled]
- Infrastructure Lead: [To be filled]

## Rollback Procedures

### Rolling Back a Release
1. Identify the commit hash of the release to rollback:
   ```bash
   git log --oneline -10
   ```

2. Revert the specific commit:
   ```bash
   git revert <commit-hash>
   ```

3. Push the revert to the repository:
   ```bash
   git push origin main
   ```

4. Deploy the reverted code to production

### Rolling Back Database Changes
1. Locate the appropriate backup file:
   ```bash
   ls -la backups/mongodb/
   ```

2. Restore from the backup:
   ```bash
   mongorestore --drop --db=ev_bunker backups/mongodb/<backup-file>
   ```

### Disabling Real-time Streams (Maintenance Mode)
1. Set the REDIS_URL environment variable to empty or comment it out
2. Restart the application
3. The application will automatically fall back to non-realtime mode

## Backup and Restore Procedures

### MongoDB Backup
```bash
mongodump --db=ev_bunker --out=backups/mongodb/$(date +%Y%m%d_%H%M%S)
```

### MongoDB Restore
```bash
mongorestore --drop --db=ev_bunker backups/mongodb/<backup-directory>
```

### Redis Backup
Redis snapshots are automatically created. To manually save:
```bash
redis-cli BGSAVE
```

## Monitoring and Alerting

### Health Checks
- Application health: `/api/health`
- Database connectivity: `/api/health-check`
- Metrics: `/api/metrics`

### Log Monitoring
Logs are available in the `logs/` directory:
- Application logs: `logs/app.log`
- Error logs: `logs/error.log`
- Database logs: `logs/db.log`

## Deployment Procedures

### Staging Deployment
1. Ensure all tests pass:
   ```bash
   npm test
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Deploy to staging environment

### Production Deployment
1. Merge staging branch to main:
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```

2. Deploy to production environment

3. Monitor application health for 30 minutes

## Troubleshooting Guide

### Application Won't Start
1. Check environment variables:
   ```bash
   cat .env
   ```

2. Verify database connectivity:
   ```bash
   npm run health-check
   ```

3. Check logs:
   ```bash
   tail -f logs/error.log
   ```

### Database Connection Issues
1. Verify MongoDB is running:
   ```bash
   systemctl status mongod
   ```

2. Check database URL in environment variables

3. Test connection manually:
   ```bash
   mongo $DATABASE_URL
   ```

### Payment Processing Failures
1. Verify Razorpay keys in environment variables
2. Check webhook configuration in Razorpay dashboard
3. Review payment logs:
   ```bash
   grep "payment" logs/app.log
   ```

### Real-time Features Not Working
1. Verify Redis is running:
   ```bash
   systemctl status redis
   ```

2. Check Redis URL in environment variables

3. Review Redis logs:
   ```bash
   tail -f /var/log/redis/redis-server.log
   ```

## Performance Optimization

### Database Indexing
Ensure proper indexes are created:
```javascript
db.stations.createIndex({ location: "2dsphere" })
db.bookings.createIndex({ userId: 1, createdAt: -1 })
```

### Caching Strategy
- User sessions: 1 hour TTL
- Station data: 5 minute TTL
- Booking data: 10 minute TTL

### Load Testing
Run load tests before major releases:
```bash
npm run load-test
```

## Security Procedures

### Secret Rotation
1. Generate new secrets:
   ```bash
   openssl rand -base64 32
   ```

2. Update environment variables

3. Restart application

### Security Scanning
Run security scans regularly:
```bash
npm audit
```

## Environment Setup

### Development Environment
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

### Production Environment
1. Install production dependencies:
   ```bash
   npm ci --production
   ```

2. Set environment variables for production

3. Start production server:
   ```bash
   npm start
   ```