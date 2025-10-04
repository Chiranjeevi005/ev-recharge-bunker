# EV Bunker - Real-time Admin Dashboard

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Connection
# Replace <db_password> with your actual MongoDB password
DATABASE_URL=mongodb+srv://chiru:<db_password>@cluster0.yylyjss.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Redis Connection (for real-time features)
# If you don't have Redis, you can use Redis Cloud or comment this out
REDIS_URL=redis://localhost:6379

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=your_nextauth_secret_here

# Razorpay Configuration (if needed)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_secret
```

### 2. Database Setup

1. Ensure you have a MongoDB Atlas account
2. Replace `<db_password>` in the DATABASE_URL with your actual MongoDB password
3. Make sure your MongoDB user has read/write permissions to the `ev_bunker` database
4. The application expects specific collection names: `clients`, `stations`, `sessions`, and `payments`

### 3. Redis Setup (Optional but Recommended)

For real-time features to work properly:

1. Install Redis locally or use a cloud service like Redis Labs
2. Update the REDIS_URL in your `.env.local` file
3. If you don't have Redis, the application will still work but without real-time updates

### 4. Running the Application

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

The application will be available at http://localhost:3002

## Features

### Real-time Dashboard
- Live updates of client activities
- Real-time monitoring of charging sessions
- Instant payment notifications
- Environmental impact tracking

### Admin Dashboard
- User management
- Station monitoring
- Session tracking
- Payment history
- Analytics and reports

## Troubleshooting

### Database Connection Issues
- Check that your DATABASE_URL is correctly formatted
- Verify your MongoDB credentials
- Ensure your IP address is whitelisted in MongoDB Atlas

### Redis Connection Issues
- If Redis is not available, real-time features will be disabled
- Check that your REDIS_URL is correctly formatted
- Verify Redis is running on the specified host and port

### API Route Issues
- If you see 500 errors on dashboard API routes, check that your database collections match the expected names (`clients`, `stations`, `sessions`, `payments`)
- Verify that your database documents have the expected structure

### API Route Issues
- If you see 500 errors on dashboard API routes, check that your database collections match the expected names (`clients`, `stations`, `sessions`, `payments`)
- Verify that your database documents have the expected structure

### Authentication Issues
- Make sure NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches your deployment URL