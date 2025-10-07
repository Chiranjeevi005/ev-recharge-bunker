# EV Bunker - Electric Vehicle Charging Station Management Platform

## 🌱 Project Overview

EV Bunker is a comprehensive electric vehicle (EV) charging station management platform with real-time monitoring, payment processing, and analytics capabilities. The application provides a complete solution for managing EV charging infrastructure with separate interfaces for administrators and clients.

This application has been fully prepared for production deployment on Vercel with all critical issues resolved, builds completing successfully, and significant security improvements implemented.

## 🚀 Key Features

### 🔐 Authentication System
- **Email/Password Authentication** for both admin and client users
- Role-based access control (RBAC) with admin and client roles
- Session management with JWT tokens
- Secure password handling with bcrypt

### 👨‍💼 Admin Dashboard
- **Real-time Monitoring**: Live updates of client activities, charging sessions, and payments
- **User Management**: View, add, and manage client accounts
- **Station Management**: Monitor and manage charging stations
- **Analytics & Reports**: Data visualization with charts and metrics
- **Payment Tracking**: View payment history and status
- **System Statistics**: Overview of key performance indicators

### 👤 Client Dashboard
- **Charging Session Tracking**: Real-time monitoring of active charging sessions
- **Payment History**: View past transactions and payment status
- **Station Finder**: Interactive map to locate nearby charging stations
- **Booking System**: Reserve charging slots at stations
- **Environmental Impact**: Track personal contribution to CO2 reduction

### ⚡ Real-time Features
- **Socket.IO Integration**: Real-time communication for live updates
- **Redis Caching**: Improved performance with caching layer
- **Live Notifications**: Instant alerts for payment updates and session changes
- **Real-time Analytics**: Live updating charts and statistics

## 🛠️ Technologies & Frameworks

- **Next.js 15** with App Router for server-side rendering and static site generation
- **TypeScript** for type safety and enhanced development experience
- **Tailwind CSS** for responsive and modern UI design
- **MongoDB** as the primary database for storing application data
- **Redis** for caching and real-time features
- **Socket.IO** for real-time communication between client and server
- **NextAuth.js** for authentication management
- **Razorpay** for payment processing
- **Arcjet Security** for bot detection and security
- **Framer Motion** for smooth animations and transitions
- **MapLibre GL** for interactive mapping features
- **Recharts** for data visualization and analytics charts
- **GSAP** for advanced animations

## 📋 Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=your_mongodb_connection_string

# Authentication Configuration
NEXTAUTH_SECRET=your_generated_secret_key
NEXTAUTH_URL=http://localhost:3002

# Redis Configuration (Optional but recommended)
REDIS_URL=redis://localhost:6379

# Payment Processing (Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_secret

# Security (Arcjet)
ARCJET_KEY=your_arcjet_key
```

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd ev-bunker

# Install dependencies
npm install
```

### 3. Database Setup

1. Ensure you have a MongoDB database (local or cloud)
2. Update the `DATABASE_URL` in your `.env.local` file
3. The application expects specific collection names: `clients`, `stations`, `sessions`, and `payments`

### 4. Redis Setup (Optional but Recommended)

For real-time features to work properly:
1. Install Redis locally or use a cloud service like Redis Labs
2. Update the `REDIS_URL` in your `.env.local` file
3. If you don't have Redis, the application will still work but without real-time updates

### 5. Running the Application

```bash
# Run the development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The application will be available at http://localhost:3002

## 🔐 Authentication Details

### Admin Login
- **Email**: admin@ebunker.com
- **Password**: [Stored securely in database - Contact system administrator]

### Client Login
- **Email**: test@example.com
- **Password**: password123

Additional test client:
- **Email**: user@example.com
- **Password**: user123

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run all tests
npm run test:utils
```

## 🚀 Deployment

The application is ready for deployment to Vercel. See `VERCEL_DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

For a quick deployment status check, see `DEPLOYMENT_READY.md`.

### Environment Variables for Production

When deploying to Vercel, set the following environment variables in the Vercel dashboard:

- `DATABASE_URL`: Your production MongoDB connection string
- `NEXTAUTH_SECRET`: A randomly generated secret key
- `NEXTAUTH_URL`: Your production domain (e.g., https://your-app.vercel.app)
- `REDIS_URL`: Your production Redis connection string (optional)
- `RAZORPAY_KEY_ID`: Your production Razorpay key ID
- `RAZORPAY_SECRET`: Your production Razorpay secret
- `ARCJET_KEY`: Your production Arcjet key

## 📁 Project Structure

```
ev-bunker/
├── src/
│   ├── app/                   # Next.js app router pages
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard pages (admin & client)
│   │   ├── login/             # Authentication pages
│   │   ├── register/          # Registration pages
│   │   └── ...                # Other pages
│   ├── components/            # React components
│   │   ├── common/            # Shared UI components
│   │   ├── dashboard/         # Dashboard-specific components
│   │   └── landing/           # Landing page components
│   ├── context/               # React context providers
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Library and utility functions
│   │   ├── auth/              # Authentication logic
│   │   ├── db/                # Database connections
│   │   ├── payment/           # Payment processing
│   │   ├── realtime/          # Real-time features
│   │   └── ...                # Other libraries
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
├── scripts/                   # Utility scripts
└── ...                        # Configuration files
```

## 🛠️ Development Scripts

- `npm run dev`: Start development server on port 3002
- `npm run build`: Create production build
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run type-check`: Run TypeScript type checking
- `npm test`: Run test suite
- `npm run seed`: Seed database with test data

## 🐛 Troubleshooting

### Database Connection Issues
- Check that your `DATABASE_URL` is correctly formatted
- Verify your MongoDB credentials
- Ensure your IP address is whitelisted in MongoDB Atlas (if using)

### Redis Connection Issues
- If Redis is not available, real-time features will be disabled
- Check that your `REDIS_URL` is correctly formatted
- Verify Redis is running on the specified host and port

### Authentication Issues
- Make sure `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your deployment URL
- Check that the database is accessible and contains user data

### Build Issues
- Run `npm run type-check` to identify TypeScript errors
- Run `npm run lint` to identify code style issues
- Ensure all environment variables are properly configured

## 📚 Additional Documentation

For more detailed information about the project, see:
- `PROJECT_REPORT.md`: Comprehensive project documentation
- `VERCEL_DEPLOYMENT_GUIDE.md`: Detailed deployment instructions
- `DEPLOYMENT_READY.md`: Deployment readiness status

## 🎉 Status

✅ **Ready for Production Deployment**
- All critical errors resolved
- Builds complete successfully
- Authentication working with enhanced security
- Real-time features functional
- Payment processing integrated
- Admin and client dashboards operational
- Significant security improvements implemented

The application is fully prepared for Vercel deployment with comprehensive documentation and deployment guides. All hardcoded credentials have been removed and authentication now uses secure database-backed verification.