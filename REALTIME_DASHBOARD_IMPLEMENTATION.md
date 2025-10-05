# Real-time Admin Dashboard Implementation

## Overview
This document outlines the implementation of real-time data updates in the admin dashboard using MongoDB Change Streams, Redis Pub/Sub, and Socket.IO. The implementation ensures that all data comes directly from MongoDB without using mock data.

## Key Components

### 1. MongoDB Change Streams
- **File**: `src/lib/db/changeStreams.ts`
- **Collections Monitored**:
  - `clients` - Client/user updates
  - `stations` - Charging station updates
  - `charging_sessions` - Charging session updates
  - `payments` - Payment transaction updates
  - `eco_stats` - Environmental statistics updates

### 2. Redis Pub/Sub
- **Purpose**: Bridge between MongoDB Change Streams and Socket.IO
- **Channel**: `client_activity_channel`
- **Function**: Publishes change events from MongoDB to Redis

### 3. Socket.IO
- **File**: `src/lib/socket.ts`
- **Purpose**: Real-time communication between server and client
- **Events Handled**:
  - `client-update`
  - `station-update`
  - `charging-session-update`
  - `payment-update`
  - `eco-stats-update`

### 4. Frontend Hook
- **File**: `src/hooks/useRealTimeData.ts`
- **Purpose**: Manages Socket.IO connection and real-time updates in React components

### 5. Admin Dashboard
- **File**: `src/app/dashboard/admin/page.tsx`
- **Purpose**: Displays real-time data with automatic updates

## Implementation Details

### MongoDB Change Streams Configuration
```typescript
const stationsCollection = db.collection('stations');
const stationsChangeStream = stationsCollection.watch([], { 
  fullDocument: 'updateLookup',
  resumeAfter: null,
  startAfter: null,
  maxAwaitTimeMS: 60000
});
```

### Event Publishing Flow
1. **MongoDB Change** → Change Stream detects modification
2. **Change Stream** → Formats event data
3. **Redis Publish** → Publishes to `client_activity_channel`
4. **Socket.IO** → Receives from Redis and broadcasts to clients
5. **Frontend** → Receives real-time update and updates UI

### Real-time Update Handling in Admin Dashboard
```typescript
case 'station_update':
  // Update stations data in real-time
  if (latestUpdate.fullDocument) {
    setStations(prevStations => {
      // Update existing station or add new one
      // ...
    });
  }
  break;
```

## Data Flow

### Initial Data Loading
1. Dashboard mounts and authenticates user
2. Fetches initial data from MongoDB via API routes:
   - `/api/dashboard/stats` - Dashboard statistics
   - `/api/clients` - Client list
   - `/api/stations` - Station list
   - `/api/payments` - Payment transactions
   - `/api/dashboard/charts` - Chart data
3. Data is cached in Redis for 5 minutes for performance

### Real-time Updates
1. User performs an action (e.g., adds a new station)
2. API endpoint updates MongoDB and publishes to Redis
3. MongoDB Change Stream detects the change
4. Change Stream publishes event to Redis
5. Socket.IO server receives event and broadcasts to connected clients
6. Admin Dashboard receives update and refreshes relevant components

## Benefits

1. **No Mock Data**: All data comes directly from MongoDB
2. **Real-time Updates**: Changes are reflected immediately in the dashboard
3. **Scalable**: Uses Redis Pub/Sub for horizontal scaling
4. **Reliable**: Includes error handling and automatic reconnection
5. **Efficient**: Caches data in Redis to reduce database load

## Unit Tests

Unit tests verify:
- Change stream initialization for all collections
- Event publishing to Redis
- Socket.IO event handling
- Frontend state updates

## Conclusion

The admin dashboard now uses real-time data from MongoDB without any mock data. All updates are automatically reflected in the UI through the MongoDB Change Streams → Redis Pub/Sub → Socket.IO pipeline, ensuring administrators always have the most current information.