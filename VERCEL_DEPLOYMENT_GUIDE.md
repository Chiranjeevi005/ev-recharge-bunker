# Vercel Deployment Guide for EV Bunker

This guide provides step-by-step instructions for deploying the EV Bunker application to Vercel.

## Prerequisites

1. A Vercel account (https://vercel.com)
2. A MongoDB database (MongoDB Atlas recommended)
3. (Optional) A Redis instance for real-time features (Upstash Redis recommended)
4. Razorpay account for payment processing
5. Arcjet account for security features

## Deployment Steps

### 1. Prepare Your Repository

Ensure your code is committed and pushed to a Git repository (GitHub, GitLab, or Bitbucket).

### 2. Create a Vercel Project

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your Git repository or drag and drop your project folder

### 3. Configure Project Settings

In the Vercel project configuration:

- **Framework Preset**: Select "Next.js"
- **Root Directory**: Leave as default (or specify if your Next.js app is in a subdirectory)
- **Build and Output Settings**:
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install`

### 4. Set Environment Variables

In the Vercel dashboard, go to your project settings and add the following environment variables:

```
# Database Configuration
DATABASE_URL=your_production_mongodb_connection_string

# Authentication Configuration
NEXTAUTH_SECRET=your_generated_secret_key
NEXTAUTH_URL=https://your-app.vercel.app

# Redis Configuration (Optional but recommended)
REDIS_URL=your_production_redis_connection_string

# Payment Processing (Razorpay)
RAZORPAY_KEY_ID=your_production_razorpay_key_id
RAZORPAY_KEY_SECRET=your_production_razorpay_secret

# Security (Arcjet)
ARCJET_KEY=your_production_arcjet_key

# Next.js Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_production_razorpay_key_id
```

To generate a secure `NEXTAUTH_SECRET`, run:
```bash
openssl rand -base64 32
```

### 5. Configure MongoDB

1. If using MongoDB Atlas:
   - Create a new cluster or use an existing one
   - Add your Vercel app's IP address to the IP whitelist (or allow access from anywhere for testing)
   - Get your connection string and add it as `DATABASE_URL` in Vercel environment variables

### 6. Configure Redis (Optional but Recommended)

1. If using Upstash Redis:
   - Create a new Redis database
   - Get your connection string and add it as `REDIS_URL` in Vercel environment variables

### 7. Configure Payment Processing (Razorpay)

1. Sign up for a Razorpay account
2. Get your production API keys
3. Add them as environment variables in Vercel:
   - `RAZORPAY_KEY_ID` (your Razorpay key ID)
   - `RAZORPAY_KEY_SECRET` (your Razorpay secret)
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID` (same as RAZORPAY_KEY_ID)

**Important**: For testing, you can use Razorpay's test keys. For production, make sure to use your live keys.

### 8. Configure Security (Arcjet)

1. Sign up for an Arcjet account
2. Get your API key
3. Add it as `ARCJET_KEY` in Vercel environment variables

### 9. Deploy

1. Click "Deploy" in the Vercel dashboard
2. Wait for the build to complete
3. Your application will be available at the provided URL

## Post-Deployment Verification

### 1. Test Authentication

- Visit your deployed application
- Try logging in with the admin credentials:
  - Email: admin@ebunker.com
  - Password: admin123
- Try logging in with a client account:
  - Email: test@example.com
  - Password: password123

### 2. Test API Endpoints

- Visit `/api/health-check` to verify the API is working
- Test other API endpoints to ensure they return expected data

### 3. Test Real-time Features

- If Redis is configured, test real-time updates in the dashboard
- Verify that live notifications work correctly

### 4. Test Payment Processing

- Try initiating a payment flow
- Verify that the Razorpay checkout opens correctly
- Test the payment verification process
- Use Razorpay's test cards for testing:
  - Card Number: 4111 1111 1111 1111
  - Expiry: Any future date
  - CVV: 123
  - OTP: 123456

### 5. Test Responsive Design

- Check the application on different device sizes
- Verify that all components render correctly

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   - Ensure all required environment variables are set in the Vercel dashboard
   - Check that variable names match exactly

2. **Database Connection Issues**
   - Verify your MongoDB connection string is correct
   - Ensure your IP address is whitelisted in MongoDB Atlas

3. **Authentication Failures**
   - Check that `NEXTAUTH_URL` matches your deployed domain
   - Verify `NEXTAUTH_SECRET` is set correctly

4. **Payment Processing Issues**
   - Ensure both `RAZORPAY_KEY_ID` and `NEXT_PUBLIC_RAZORPAY_KEY_ID` are set
   - Check that you're using production keys, not test keys
   - Verify the keys are correct and not expired
   - Check server logs for detailed error messages

5. **Real-time Features Not Working**
   - Verify Redis is configured correctly
   - Check that `REDIS_URL` is set in environment variables

### Logs and Monitoring

- Use Vercel's log viewer to check for build errors
- Monitor function execution logs for runtime errors
- Set up Vercel Analytics for performance monitoring

## Scaling Considerations

1. **Database Connections**
   - Use connection pooling for MongoDB
   - Monitor database performance and scale as needed

2. **Redis Usage**
   - Monitor Redis memory usage
   - Consider upgrading your Redis plan if needed

3. **Bandwidth and Compute**
   - Monitor Vercel usage metrics
   - Upgrade your Vercel plan if needed

## Updating Your Deployment

To update your deployed application:

1. Push changes to your Git repository
2. If you have automatic deployments enabled, Vercel will automatically deploy
3. If not, go to your Vercel dashboard and click "Deploy" to trigger a new deployment

## Support

For issues with deployment, check:
- Vercel documentation: https://vercel.com/docs
- Next.js documentation: https://nextjs.org/docs
- This project's README.md and other documentation files
- PAYMENT_TROUBLESHOOTING.md for payment-specific issues