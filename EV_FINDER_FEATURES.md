# EV Charging Station Finder - Features Documentation

## Overview
The EV Charging Station Finder is a futuristic map-based interface built with MapLibre GL JS that allows users to locate, view details, and book EV charging stations.

## Core Features

### 1. Interactive Map
- **MapLibre GL JS** with OpenFreeMap vector tiles (no API keys required)
- Zoom, pan, and drag functionality similar to Google Maps
- Geolocation support to center map on user's location
- Multiple map themes (Liberty, Positron, Bright)

### 2. Charging Station Visualization
- Custom neon-themed markers with pulse animations for available stations
- Different styling for favorite stations (orange glow)
- Route visualization with gradient line effects
- User location marker with pulsing animation

### 3. Station Information
- Detailed info panels showing:
  - Station name and address
  - Phone contact information
  - Available slots vs total slots
  - Pricing information
  - Fast charging availability
- Favorite station functionality (star toggle)

### 4. Search & Filtering
- Location search using Nominatim geocoding
- Advanced filters:
  - Available slots only
  - Fast charging stations
  - Price range slider

### 5. Booking System
- Slot selection interface
- Simulated payment processing
- Real-time availability updates
- Booking confirmation alerts

### 6. Responsive Design
- Desktop: Full map viewport with floating panels
- Mobile: Optimized layout with collapsible elements
- Consistent futuristic theme with neon accents

## Technical Implementation

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **MapLibre GL JS** for mapping
- **MapLibre Geocoder** for search functionality

### Backend
- **Next.js API Routes** for data handling
- Mock data for charging stations
- Simulated booking system

### Components
- `BunkFinderMap` - Main map component with all features
- `EVFinder` - Page component integrating the map
- API route at `/api/stations` for data access

## User Flow
1. User visits the EV Finder page
2. Map automatically centers on their location
3. Charging stations are displayed as neon markers
4. User can search for locations or filter stations
5. Clicking a marker shows station details
6. User can favorite stations or book a slot
7. Booking process shows slot selection and payment simulation
8. Availability updates in real-time after booking

## Styling
- Semi-dark futuristic theme
- Neon cyan to purple gradient accents
- Glowing effects for interactive elements
- Smooth animations for transitions
- Consistent design language across all components