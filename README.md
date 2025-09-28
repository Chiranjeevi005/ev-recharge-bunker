# EV Bunker - Electric Vehicle Charging Platform

A futuristic web application for booking electric vehicle charging stations with real-time availability, secure payments, and comprehensive booking management.

## Features

### Client Dashboard
- **Interactive Map**: Google Maps integration with glowing pins for charging stations
- **Quick Booking**: One-click slot booking with Razorpay payment integration
- **Real-time Stats**: Animated counters for EVs charged, active bunks, and trips completed
- **Booking History**: Detailed view of past bookings with status indicators
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop devices

### Authentication
- **Secure Login/Registration**: Email/password and Google OAuth options
- **Role-based Access**: Separate dashboards for clients and administrators
- **Session Management**: Secure session handling with NextAuth.js

### Admin Panel
- **Station Management**: Add, edit, and remove charging stations
- **Booking Oversight**: View and manage all bookings
- **User Management**: Administer user accounts and permissions

### API Loading Indicator
- **Futuristic Animation**: Theme-consistent loading animation for API calls
- **Flexible Display**: Inline component or full-page overlay
- **Multiple Sizes**: Small, medium, and large variations
- **Customizable**: Support for custom messages and styling

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI/UX**: Framer Motion for animations, Lottie for energy effects
- **State Management**: React Context API
- **Authentication**: NextAuth.js with credentials and Google OAuth
- **Database**: PostgreSQL with Prisma ORM
- **Payments**: Razorpay integration
- **Mapping**: Google Maps API
- **Testing**: Jest and React Testing Library
- **Deployment**: Docker support, CI/CD ready

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Google Maps API key
- Razorpay account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ev-bunker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Run database migrations:
```bash
# Start your MongoDB server
# The application will automatically connect to MongoDB
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3002

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # Reusable UI components
├── lib/              # Utility functions and configurations
└── tests/            # Unit and integration tests
```

## Key Components

### UI Components
- `Button`, `Card`, `Input`, `Logo` - Basic UI elements
- `LoadingScreen` - Futuristic battery charging animation for initial load
- `ApiLoadingIndicator` - Futuristic animation for API calls
- `FloatingActionButton` - Primary action button with animations
- `EnergyAnimation` - Lottie-based energy effects

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
- [API Loading Indicator](API_LOADING_INDICATOR.md)
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