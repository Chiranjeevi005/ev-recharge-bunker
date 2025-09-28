# Futuristic Map Component for EV Bunker

This document describes the implementation of the Futuristic Map component for the EV Bunker web application.

## Overview

The Futuristic Map is a custom map component built with MapLibre GL JS that provides a Google Maps-like experience with a futuristic, cinematic EV theme. It features a semi-dark theme with neon accents, animated elements, and specialized functionality for EV charging stations.

## Features

### 1. Map Base & Data
- Uses MapLibre GL JS as the map engine
- Base map tiles from OpenStreetMap via OpenFreeMap
- Accurate road, street, and POI details from OSM data
- Fully zoomable, pannable, and draggable with Google Maps-like UX

### 2. Theme & Styling
- **Overall Theme:** Futuristic, professional, semi-dark with neon accents
- **Colors:**
  - Land: Light slate / silver
  - Water: Gradient teal → blue
  - Roads: Glowing cyan / blue edges
  - Labels: Minimal, futuristic sans-serif font with subtle glow
- **Markers:**
  - EV Charging Stations: Glowing neon bolt ⚡ icons
  - User Location: Animated radar pulse circle
  - Favorites: Distinct glowing markers
- **Route Lines:** Animated gradient flow (cyan → purple) for selected paths
- **Hover & Click Effects:** Marker expands with glow and shows info tooltip
- **Background Animation:** Subtle energy arcs behind map for cinematic effect

### 3. Map Functionality
- **Search & Geocoding:**
  - Search bar to locate addresses using OSM Nominatim API
  - Autocomplete suggestions
- **Routing & Directions:**
  - Display routes from user to nearby EV charging stations
  - Animated route lines for selected path
- **Markers & Popups:**
  - Show real-time slot availability, station name, pricing
  - Clicking marker opens animated info panel
- **Layer Control:**
  - Toggle between Futuristic Map, Minimal EV-only Map
- **Favorites / Quick Access:**
  - Users can save favorite charging stations
  - Displayed with distinct glowing markers

### 4. UI & UX
- Map controls: Zoom, locate me, layer toggle, search bar → all styled as floating neon buttons
- Mobile responsiveness: Pinch-to-zoom, scrollable overlays, adaptive marker sizes
- Loading animation: Subtle neon energy pulse while map or route data loads
- Smooth Framer Motion transitions for hover, popups, and panels

## Implementation Details

### Tech Stack
- Next.js 15 with App Router
- MapLibre GL JS for map rendering
- MapLibre Geocoder for search functionality
- Tailwind CSS for styling
- Framer Motion for animations
- TypeScript for type safety

### Component Structure
The map is implemented as a reusable React component:
- File: `src/components/landing/FuturisticMap.tsx`
- Exported in: `src/components/landing/index.ts`
- Used in: Home page, Client Dashboard, Admin Dashboard, and standalone demo page

### Key Features Implementation

1. **Custom Map Styling:**
   - Custom CSS for markers, controls, and popups
   - Neon glow effects using box-shadow
   - Animated elements with CSS keyframes

2. **Interactive Elements:**
   - Charging station markers with click handlers
   - User location marker with pulsing animation
   - Route visualization with gradient coloring

3. **Layer Control:**
   - Toggle between different map styles
   - Futuristic, Minimal, and Satellite options

4. **Search Functionality:**
   - Integrated MapLibre Geocoder with Nominatim
   - Custom styling to match the futuristic theme

5. **Responsive Design:**
   - Adapts to different screen sizes
   - Mobile-friendly controls and interactions

## Usage

To use the Futuristic Map component in your application:

```jsx
import { FuturisticMap } from '@/components/landing/FuturisticMap';

// In your component
<FuturisticMap />
```

## Customization

The component can be customized by modifying:
- Color scheme in the CSS styles
- Charging station data in the component
- Map styles by changing the style URLs
- Animation parameters in the CSS keyframes

## Future Enhancements

1. **Real-time Data Integration:**
   - Connect to backend for live charging station availability
   - Dynamic pricing updates

2. **Advanced Routing:**
   - Multi-stop route planning
   - EV-specific routing considering charging needs

3. **Enhanced Animations:**
   - More complex particle effects
   - 3D building visualization

4. **Additional Map Layers:**
   - Traffic data
   - Weather overlays
   - EV-friendly routes highlighting

## Dependencies

The component requires the following npm packages:
- `maplibre-gl`: Core map rendering library
- `@maplibre/maplibre-gl-geocoder`: Search functionality
- `framer-motion`: Animation library
- `next`: Next.js framework
- `react`: React library

## Styling

The component uses Tailwind CSS classes for layout and styling, with custom CSS for map-specific elements. All styling follows the EV Bunker color scheme:
- Primary: Emerald green (#10B981)
- Secondary: Purple (#8B5CF6)
- Background: Dark blue-gray (#1E293B)
- Cards: Medium blue-gray (#334155)
- Text: Light gray (#F1F5F9)