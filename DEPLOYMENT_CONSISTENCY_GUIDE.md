# Deployment Consistency Guide

This guide ensures that the deployed version of the EV Bunker web app matches the localhost development version exactly in terms of functionality, aesthetics, and user experience.

## 1. Environment Configuration

### Required Environment Variables
Ensure all environment variables from `.env.local` are properly set in the production environment:

```bash
# Database Configuration
DATABASE_URL=mongodb+srv://username:password@cluster.example.com/database_name

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com

# Redis Configuration (optional but recommended)
REDIS_URL=redis://localhost:6379

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id

# Arcjet Security (optional)
ARCJET_KEY=your_arcjet_key

# Environment
NODE_ENV=production
```

## 2. Build Process

### Production Build
```bash
npm run build
```

This creates an optimized production build with:
- Standalone server in `.next/standalone`
- Static assets in `.next/static`
- Server-side rendered pages
- Optimized JavaScript bundles

## 3. Server Startup

### Windows Startup
```bash
npm run start:windows
```

This script automatically:
- Loads environment variables from `.env.local`
- Sets NODE_ENV to 'production'
- Sets PORT to 3002
- Starts the standalone server

### Manual Startup
```bash
$env:PORT="3002"; node .next/standalone/server.js
```

## 4. Animation Consistency

### GSAP Animations
- All GSAP animations should work identically in production
- Check that `gsap` is properly imported in all components
- Verify that animations are not blocked by strict mode

### Framer Motion Transitions
- Page transitions should be smooth and consistent
- Hover effects should be responsive
- Loading animations should display correctly

### Loading Screens
- Initial loading screen should show the logo animation
- Route transitions should display the loader
- All loading states should have consistent styling

## 5. Functionality Verification

### User Authentication
- Client login with email/password: `test@example.com` / `password123`
- Admin login with email/password: `admin@ebunker.com` / `admin123`
- Session management should work correctly
- Logout functionality should clear sessions

### Map Functionality
- Map should load and display charging stations
- Station markers should be clickable
- User location should be detected and displayed
- Search functionality should work

### Booking System
- Users should be able to select stations and slots
- Duration selection should work correctly
- Price calculation should be accurate
- Booking confirmation should display properly

### Payment Integration
- Payment flow should initiate correctly
- Razorpay checkout should load
- Payment verification should work
- Payment history should update

### Dashboard
- Client dashboard should display booking history
- Admin dashboard should show analytics
- Real-time updates should work
- All charts and statistics should display correctly

## 6. Aesthetics Verification

### Styling Consistency
- All Tailwind CSS classes should work
- Custom CSS in `globals.css` should apply
- Fonts should load correctly
- Colors should match design specifications

### Responsive Design
- Mobile layout should work on small screens
- Tablet layout should work on medium screens
- Desktop layout should work on large screens
- Orientation changes should be handled properly

### Component Consistency
- Buttons should have consistent styling
- Cards should have proper shadows and borders
- Forms should have correct spacing and alignment
- Navigation should be consistent across pages

## 7. Performance Optimization

### Bundle Optimization
- JavaScript bundles should be minimized
- Images should be optimized
- Fonts should be loaded efficiently
- Critical CSS should be inlined

### Caching Strategy
- Static assets should be cached
- API responses should be cached where appropriate
- Database queries should be optimized
- Redis should be used for session storage

## 8. Testing Checklist

Before deploying, verify all aspects:

### Visual Elements
- [ ] Logo displays correctly
- [ ] All images load properly
- [ ] Fonts render correctly
- [ ] Colors match design
- [ ] Animations play smoothly
- [ ] Loading states show properly

### Navigation
- [ ] All links work
- [ ] Back button functions
- [ ] Route transitions are smooth
- [ ] 404 page displays for invalid routes

### Functionality
- [ ] User can register
- [ ] User can login/logout
- [ ] User can book a station
- [ ] User can make a payment
- [ ] User can view booking history
- [ ] Admin can access dashboard
- [ ] Admin can view analytics

### Performance
- [ ] Pages load within 3 seconds
- [ ] Animations don't cause lag
- [ ] Map loads quickly
- [ ] No console errors

### Cross-browser Compatibility
- [ ] Works in latest Chrome
- [ ] Works in latest Firefox
- [ ] Works in latest Safari
- [ ] Works in latest Edge

## 9. Troubleshooting

### Common Issues

#### Animations Not Working
1. Check that `gsap` and `framer-motion` are installed
2. Verify imports are correct in components
3. Ensure components are marked as "use client"
4. Check for JavaScript errors in console

#### Environment Variables Not Loading
1. Verify `.env.local` exists in production
2. Check that variables are exported correctly
3. Ensure no extra spaces or quotes in values
4. Restart server after changing variables

#### Database Connection Issues
1. Verify DATABASE_URL is correct
2. Check that MongoDB is accessible
3. Ensure credentials are correct
4. Test connection with a simple script

#### Payment Processing Errors
1. Verify Razorpay keys are correct
2. Check that keys are set in environment variables
3. Ensure client-side key is public (NEXT_PUBLIC_)
4. Test with Razorpay's test mode

### Debugging Steps

1. Check browser console for errors
2. Check server logs for errors
3. Verify network requests in dev tools
4. Test API endpoints directly
5. Check database connectivity
6. Verify environment variables

## 10. Maintenance

### Regular Checks
- [ ] Monitor server performance
- [ ] Check database connections
- [ ] Verify payment processing
- [ ] Update dependencies regularly
- [ ] Review security settings
- [ ] Backup database regularly

### Updates
When updating the application:
1. Test all changes in development
2. Run full build process
3. Verify all functionality in staging
4. Deploy during low-traffic periods
5. Monitor for issues after deployment

By following this guide, you can ensure that your deployed application provides the exact same experience as your localhost development version.