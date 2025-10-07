# Environment Variables Synchronization Report

## Overview
This document maps all environment variables between localhost development and Vercel production environments to ensure consistency and proper functionality.

## Required Environment Variables

### Database Configuration
| Variable | Localhost Example | Vercel Production | Notes |
|----------|-------------------|-------------------|-------|
| DATABASE_URL | mongodb://localhost:27017/ev_bunker | mongodb+srv://user:pass@cluster.mongodb.net/db | Must be a production MongoDB URI |
| MONGODB_URI | mongodb://localhost:27017/ev_bunker | mongodb+srv://user:pass@cluster.mongodb.net/db | Alternative variable name |

### Authentication Configuration
| Variable | Localhost Example | Vercel Production | Notes |
|----------|-------------------|-------------------|-------|
| NEXTAUTH_SECRET | SuqrDIOYjveY0px3uNru4X0qc1No1DfG | [Generate new secure key] | Must be a random 32-character string |
| NEXTAUTH_URL | http://localhost:3002 | https://your-app.vercel.app | Must match your deployed domain |
| AUTH_SECRET | SuqrDIOYjveY0px3uNru4X0qc1No1DfG | [Same as NEXTAUTH_SECRET] | Alternative variable name |

### Redis Configuration (Optional but Recommended)
| Variable | Localhost Example | Vercel Production | Notes |
|----------|-------------------|-------------------|-------|
| REDIS_URL | redis://localhost:6379 | rediss://:password@host:port | Use Upstash Redis for Vercel |

### Payment Processing (Razorpay)
| Variable | Localhost Example | Vercel Production | Notes |
|----------|-------------------|-------------------|-------|
| RAZORPAY_KEY_ID | rzp_test_RPS4VC3EINUb3D | rzp_live_XXXXXXXXXXXX | Live key for production |
| RAZORPAY_SECRET | 87TSpJ63uYMG4ZPpppQWFNQm | XXXXXXXXXXXXXXXXXXXXXXXX | Live secret for production |
| NEXT_PUBLIC_RAZORPAY_KEY_ID | rzp_test_RPS4VC3EINUb3D | rzp_live_XXXXXXXXXXXX | Public key for frontend |

### Security (Arcjet)
| Variable | Localhost Example | Vercel Production | Notes |
|----------|-------------------|-------------------|-------|
| ARCJET_KEY | ajkey_01k68gmjgwemkazwfw6vndwnw9 | ajkey_XXXXXXXXXXXXXXXXXXXXXXXXXX | Production Arcjet key |

### Application Configuration
| Variable | Localhost Example | Vercel Production | Notes |
|----------|-------------------|-------------------|-------|
| NEXT_PUBLIC_APP_URL | http://localhost:3002 | https://your-app.vercel.app | Public URL for the application |

## Vercel-Specific Environment Variables

### Build Configuration
| Variable | Value | Purpose |
|----------|-------|---------|
| NODE_ENV | production | Ensures production optimizations |
| NEXT_TELEMETRY_DISABLED | 1 | Disables Next.js telemetry |

## Verification Checklist

### Before Deployment
- [ ] Generate new NEXTAUTH_SECRET for production
- [ ] Update NEXTAUTH_URL to match deployed domain
- [ ] Configure production DATABASE_URL
- [ ] Set up Redis (optional but recommended)
- [ ] Update Razorpay keys for production
- [ ] Configure Arcjet for production

### After Deployment
- [ ] Test authentication flow
- [ ] Verify database connectivity
- [ ] Test payment processing
- [ ] Confirm real-time features work
- [ ] Validate environment variables in Vercel logs

## Security Best Practices

1. Never commit secrets to version control
2. Use Vercel's environment variable encryption
3. Rotate secrets regularly
4. Use different keys for development and production
5. Restrict access to environment variables in Vercel dashboard

## Troubleshooting

### Common Issues
1. **Authentication failures**: Check NEXTAUTH_URL matches deployed domain
2. **Database connection errors**: Verify DATABASE_URL format and credentials
3. **Payment processing issues**: Confirm Razorpay keys are for the correct environment
4. **Real-time features not working**: Ensure REDIS_URL is properly configured

### Debugging Steps
1. Check Vercel deployment logs for environment variable errors
2. Add console.log statements to verify variables are loaded
3. Test API routes that depend on environment variables
4. Use Vercel's environment variable preview feature