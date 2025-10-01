# EV Bunker - Electric Vehicle Charging Platform

## Overview

EV Bunker is a modern web application for managing electric vehicle charging stations. It provides users with real-time availability information, booking capabilities, and payment processing.

## Features

- Real-time charging station availability
- Slot booking and payment processing
- User authentication (Google OAuth and email/password)
- Interactive maps with station locations
- Booking history and payment records
- Responsive design for all devices

## Tech Stack

- **Frontend**: Next.js 13+, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js with Google OAuth and Credentials provider
- **Payments**: Razorpay integration
- **Maps**: Google Maps Platform
- **Animations**: Framer Motion
- **UI Components**: Custom-built with Tailwind CSS

## Key Components

### UI Components
- `Button`, `Card`, `Input`, `Logo` - Basic UI elements
- `LoadingScreen` - Futuristic battery charging animation for initial load
- `UniversalLoader` - Reusable loading animation for API calls and transitions

### Dashboard Components
- `BookingPanel` - Modal for booking slots and payments
- `MapSection` - Interactive map with station markers
- `PastBookings` - History of previous bookings
- `QuickStats` - Animated statistics counters

## Documentation

- [Authentication Setup](AUTHENTICATION.md)
- [Google OAuth Configuration](GOOGLE_OAUTH_SETUP.md)
- [Loading Screen Guide](LOADING_SCREEN_GUIDE.md)
- [Testimonials Guide](TESTIMONIALS_GUIDE.md)
- [Dashboard Features](DASHBOARD_FEATURES.md)
- [Google Maps Setup](GOOGLE_MAPS_SETUP.md)
- [Razorpay Integration](RAZORPAY_SETUP.md)
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md)

## Testing

Run the test suite:
```bash
npm test
```

## Deployment

Build for production:
```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [NextAuth.js](https://next-auth.js.org/)
- [Razorpay](https://razorpay.com/)
- [Google Maps Platform](https://cloud.google.com/maps-platform)