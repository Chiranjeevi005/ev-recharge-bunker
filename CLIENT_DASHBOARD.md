# Client Dashboard Implementation

## Overview
This document describes the implementation of the Client Dashboard for the EV Recharge Bunk web app. The dashboard provides real-time tracking of charging sessions, payment status, slot availability, and recent history with a futuristic, professional design.

## Features Implemented

### 1. Layout & Design
- **Responsive Dashboard Layout**: Full-width design with no container constraints
- **Theme**: 90% light + 10% dark futuristic accents
- **Sections**:
  - Charging Session Tracker (main widget with animated progress bar)
  - Slot Availability Map/Widget (real-time slot counts)
  - Payment Status & History
  - Quick Actions CTA (Book Slot, Pay Now, View History)

### 2. Real-time Features (Redis with Fallback)
- **Charging Session Live Updates**:
  - Countdown timer, energy consumed (kWh), cost estimate
  - Pulls from Redis key `charging:session:{userId}` when available
  - Falls back to MongoDB when Redis is not available
  - Updates UI every 2 seconds via Socket.io

- **Payment Updates**:
  - Stores Razorpay status in Redis `payment:status:{userId}` when available
  - Shows "Pending → Processing → Success" animation
  - Caches payment history in Redis with 5-minute TTL

- **Slot Availability**:
  - Caches availability in Redis per station when available:
    `station:{city}:{id}:availability`
    `{ slotsAvailable: 4, waitingTime: "10 mins" }`
  - Auto-refreshes on dashboard in real-time
  - Falls back to MongoDB calculation when Redis not available

### 3. Permanent Data (MongoDB)
- **Completed Sessions**:
  ```json
  {
    "userId": "user123",
    "stationId": "station456",
    "startTime": "2023-06-15T10:00:00Z",
    "endTime": "2023-06-15T12:00:00Z",
    "totalEnergyKWh": 45.2,
    "totalCost": 226.0,
    "paymentStatus": "completed",
    "location": "Delhi Metro Station"
  }
  ```

- **Payment History**:
  ```json
  {
    "userId": "user123",
    "paymentId": "pay789",
    "amount": 226.0,
    "status": "success",
    "method": "Razorpay",
    "date": "2023-06-15T12:00:00Z"
  }
  ```

### 4. UI Widgets
- **Main Dashboard Card**: Charging status with animated circular progress bar and futuristic glowing effects
- **Availability Widget**: Real-time slot counts + "Book Slot" button
- **Payment History**: List of last 3-5 payments (fast load from Redis cache, full from MongoDB)
- **Notifications**: Real-time banner via Socket.io for slot availability or payment success

### 5. Security
- **Auth.js Session**: Required for accessing the dashboard page
- **Server-side Verification**: Sensitive actions protected by JWT + session
- **Graceful Degradation**: System continues to work even when Redis is unavailable

## File Structure
```
src/
├── app/
│   ├── dashboard/
│   │   └── page.tsx              # Main dashboard page
│   ├── api/
│   │   ├── dashboard/
│   │   │   ├── session/
│   │   │   │   └── route.ts      # Fetch live session from Redis/MongoDB
│   │   │   ├── payments/
│   │   │   │   └── route.ts      # Fetch recent payments from Redis/MongoDB
│   │   │   ├── slots/
│   │   │   │   └── route.ts      # Fetch slot availability from Redis/MongoDB
│   │   │   └── book/
│   │   │       └── route.ts      # Book slot, update Redis/MongoDB
├── components/
│   ├── dashboard/
│   │   ├── ChargingStatusCard.tsx
│   │   ├── SlotAvailabilityCard.tsx
│   │   ├── PaymentHistoryCard.tsx
│   │   ├── NotificationBanner.tsx
│   │   └── index.ts
├── lib/
│   ├── redis.ts                  # Redis configuration with fallback
│   ├── socket.ts                 # Socket.io server with Redis Pub/Sub
```

## API Endpoints

### GET /api/dashboard/session
Fetches active charging session for a user
- **Parameters**: `userId` (query string)
- **Response**: Charging session data or null
- **Fallback**: Uses MongoDB when Redis unavailable

### GET /api/dashboard/payments
Fetches recent payment history for a user
- **Parameters**: `userId` (query string)
- **Response**: Array of payment objects
- **Fallback**: Uses MongoDB when Redis unavailable

### GET /api/dashboard/slots
Fetches slot availability for nearby stations
- **Parameters**: `userId` (query string)
- **Response**: Array of slot availability objects
- **Fallback**: Calculates from MongoDB when Redis unavailable

### POST /api/dashboard/book
Books a charging slot and updates Redis/MongoDB
- **Body**: `{ userId, stationId, slotId, duration }`
- **Response**: Success status and session ID
- **Graceful Degradation**: Works without Redis, just slower

## Real-time Updates Flow

1. **User connects to dashboard**:
   - Socket.io connection established
   - User joins their personal room

2. **Data fetching**:
   - Active session fetched from Redis (fallback to MongoDB)
   - Payment history fetched from Redis (fallback to MongoDB)
   - Slot availability fetched from Redis (fallback to MongoDB)

3. **Real-time updates**:
   - Redis Pub/Sub broadcasts updates (when available)
   - Socket.io forwards to appropriate user rooms
   - UI updates automatically

4. **Session progress**:
   - Redis key updated every 2 seconds (when available)
   - Frontend polls for updates via Socket.io

## Example Flow

1. **User logs in** → redirected to dashboard
2. **Dashboard loads**:
   - Fetches session data from Redis (if available, fallback to MongoDB)
   - Fetches recent payments from Redis (if available, fallback to MongoDB)
3. **If charging** → live countdown + real-time energy tracking
4. **If payment pending** → Razorpay status shown with animations
5. **Completed session** → saved permanently in MongoDB

## Technology Stack
- **Frontend**: Next.js + TailwindCSS + shadcn/ui
- **Auth**: Auth.js (Google login for clients)
- **Backend**: Node.js (Next.js API routes)
- **Database**: MongoDB (permanent storage)
- **Real-time**: Redis (Pub/Sub + caching) with graceful fallback
- **Payment**: Razorpay (demo flow)

## Design Elements
- **Futuristic Theme**: Professional, semi-dark with light blends
- **Animations**: Smooth transitions with Framer Motion
- **Responsive Layout**: Works on all device sizes
- **Glowing Effects**: Subtle neon accents on interactive elements
- **Glassmorphism**: Frosted glass effect on cards and panels

## Fallback Mechanism
When Redis is not available:
1. All API routes gracefully fall back to MongoDB
2. Real-time updates work through Socket.io without Redis Pub/Sub
3. Caching is disabled but functionality remains
4. System continues to operate with slightly higher latency