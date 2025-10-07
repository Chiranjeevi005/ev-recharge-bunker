# Vercel Deployment Guide for EV Bunker

## Required Environment Variables

To ensure the payment integration and all features work correctly in the deployed application, you need to set the following environment variables in your Vercel project:

### Database Configuration
- `DATABASE_URL` - MongoDB Atlas connection string
- `NEXTAUTH_SECRET` - Secret for NextAuth.js
- `NEXTAUTH_URL` - The URL of your deployed application

### Redis Configuration (Optional but recommended)
- `REDIS_URL` - Redis connection string for real-time features

### Payment Processing
- `RAZORPAY_KEY_ID` - Private Razorpay key ID (starts with `rzp_`)
- `RAZORPAY_KEY_SECRET` - Private Razorpay key secret
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Public Razorpay key ID (same as private for test keys)

### Security
- `ARCJET_KEY` - Arcjet security key (optional)

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to the "Settings" tab
4. Click on "Environment Variables" in the left sidebar
5. Add each of the required environment variables listed above

## Important Notes

1. **Environment Variable Names**: Make sure the names match exactly as listed above
2. **Public vs Private Keys**: 
   - `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are private and should never be exposed
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID` is public and safe to expose to the frontend
3. **Test vs Live Keys**: Use test keys during development and switch to live keys for production

## Common Issues and Solutions

### Payment Integration Not Working
- **Issue**: "RAZORPAY_KEY_SECRET not found" error
- **Solution**: Ensure `RAZORPAY_KEY_SECRET` is set in Vercel environment variables

### Frontend Payment Dialog Not Opening
- **Issue**: Razorpay checkout not loading
- **Solution**: Ensure `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set correctly

### Database Connection Issues
- **Issue**: "Database connection failed" errors
- **Solution**: Verify `DATABASE_URL` is correct and the MongoDB Atlas cluster is accessible

## Deployment Process

1. Push your code to GitHub
2. Vercel will automatically deploy the new changes
3. Monitor the deployment logs for any errors
4. After deployment, verify all features work correctly

## Testing After Deployment

1. Visit your deployed application
2. Try to book a charging slot
3. Proceed to payment
4. Verify the Razorpay checkout opens
5. Complete a test payment (use test card details)
6. Check if the confirmation page loads correctly

## Test Card Details for Razorpay

For testing payments, use these test card details:
- Card Number: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: 123
- Name: Any name
- OTP: 123456

## Troubleshooting

If you encounter issues after deployment:

1. Check the Vercel deployment logs
2. Verify all environment variables are set correctly
3. Check the browser console for JavaScript errors
4. Check the network tab for failed API requests
5. Look at the application logs in Vercel's log viewer

## Support

If you continue to experience issues, please check:
1. The GitHub repository for recent updates
2. The issue tracker for known problems
3. Contact support if needed