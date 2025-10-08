# EV Bunker - Vercel Deployment Checklist

## Overview
This document provides guidance for deploying the EV Bunker application to Vercel. Due to Vercel's serverless architecture, some features behave differently than in traditional server environments.

## Vercel Deployment Considerations

### Real-time Features Limitations
- **Socket.IO/WebSocket connections are not supported** on Vercel's serverless platform
- The application automatically detects when it's running on Vercel and falls back to polling mechanisms
- Real-time updates will still work but with a slight delay (polling interval of 30 seconds)

### Environment Detection
The application automatically detects Vercel deployments using these environment variables:
- `NEXT_PUBLIC_VERCEL_ENV` === 'production'
- `VERCEL` === '1'
- `window.location.hostname` includes 'vercel.app'

### Fallback Mechanisms
When deployed to Vercel:
1. Socket.IO connections are disabled
2. Data is refreshed every 30 seconds via polling
3. Real-time status indicators show "Not available (Vercel deployment)"

## Required Environment Variables

Set these environment variables in your Vercel project dashboard:

```
DATABASE_URL=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-app.vercel.app
REDIS_URL=your_redis_connection_string (optional)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
ARCJET_KEY=your_arcjet_key
```

## Deployment Steps

1. **Prepare your code**
   ```bash
   npm run build
   ```

2. **Deploy using Vercel CLI**
   ```bash
   vercel --prod
   ```

3. **Set environment variables** in the Vercel dashboard

4. **Verify deployment**
   - Check that the dashboard loads correctly
   - Confirm real-time status shows "Not available (Vercel deployment)"
   - Test authentication and basic functionality

## Troubleshooting

### "Real-time connection: Connecting..." Issue
This is expected behavior on Vercel. The application will show this status during development but will automatically detect Vercel deployments and show "Not available (Vercel deployment)" instead.

### Data Not Updating in Real-time
This is expected on Vercel. Data updates every 30 seconds via polling instead of real-time WebSocket updates.

## Performance Optimization

### Caching Strategy
- Static assets are cached for 1 year
- API routes are not cached to ensure data freshness
- Dashboard data is refreshed every 30 seconds

### Region Selection
The application is configured to deploy to the `iad1` region (Washington, D.C.) for optimal performance.

## Monitoring

### Health Checks
- `/api/health-check` endpoint for monitoring
- Vercel's built-in analytics and monitoring
- Error tracking through console logs

## Rollback Procedure

If issues occur after deployment:
1. Use Vercel's rollback feature to revert to the previous deployment
2. Check logs for error messages
3. Verify environment variables are correctly set

## Support

For deployment issues, contact the development team or check:
- Vercel documentation: https://vercel.com/docs
- Next.js documentation: https://nextjs.org/docs