# EV Bunker Transition System Documentation

## Overview
The EV Bunker Transition System provides smooth, cinematic page transitions without flickers or white flashes. This system ensures that every page change feels connected and polished.

## How It Works

### Core Components

1. **Persistent Loader**: The loader component is always mounted but controlled by visibility rather than conditional rendering
2. **Route Transition Handler**: Listens to Next.js router events to show/hide the loader at appropriate times
3. **Controlled Delays**: Ensures loader animations complete before pages change
4. **State Machine**: Manages loader states (IDLE → LOADING → TRANSITION_OUT → IDLE)

### Implementation Details

The system uses a combination of:
- Next.js router events (`routeChangeStart`, `routeChangeComplete`, `routeChangeError`)
- Framer Motion for smooth animations
- CSS visibility control instead of conditional rendering
- Timeout-based delays to synchronize transitions

## Usage

### Adding Transitions to a Page

To add smooth transitions to any page component:

```tsx
"use client";

import { useRouteTransition } from '@/hooks/useRouteTransition';

export default function MyPage() {
  // Initialize route transition handler
  useRouteTransition();
  
  // Your page content...
  return (
    <div>
      {/* Page content */}
    </div>
  );
}
```

### Manual Loader Control

You can also manually control the loader for custom loading scenarios:

```tsx
"use client";

import { useLoader } from '@/lib/LoaderContext';

export default function MyComponent() {
  const { showLoader, hideLoader } = useLoader();
  
  const handleDataLoad = async () => {
    showLoader("Loading data...");
    
    try {
      // Perform async operation
      await fetchData();
    } finally {
      // Add a small delay to ensure smooth transition
      setTimeout(() => {
        hideLoader();
      }, 300);
    }
  };
  
  return (
    <div>
      <button onClick={handleDataLoad}>Load Data</button>
    </div>
  );
}
```

## Key Features

### 1. No Flickering
- Loader is always mounted, preventing remount flickers
- Uses CSS visibility instead of conditional rendering
- Synchronized animations ensure smooth transitions

### 2. Cinematic Transitions
- 300ms delay ensures loader animations complete fully
- Smooth fade in/out using Framer Motion
- Consistent timing across all transitions

### 3. Global Implementation
- RouteTransitionHandler component added to root layout
- Works automatically with all Next.js navigation
- No additional setup required for new pages

### 4. Manual Control
- `showLoader(message, state)` - Show loader with custom message and state
- `hideLoader()` - Hide loader with smooth transition
- `updateLoader(message, state)` - Update loader message and state

## Loader States

The loader supports different visual states:
- `loading` - Default purple/green glow (default)
- `success` - Green glow for success states
- `error` - Red glow for error states
- `idle` - Subtle glow for idle states

## Testing

The transition system includes comprehensive tests:
- Route transition event handling
- Loader context functionality
- Component integration

Run tests with:
```bash
npm test
```

## Customization

### Adjusting Transition Timing

To modify the transition delay, update the timeout in `useRouteTransition.ts`:

```tsx
const handleRouteChangeComplete = () => {
  // Change 300 to your preferred delay (in milliseconds)
  setTimeout(() => {
    hideLoader();
  }, 300);
};
```

### Custom Loader Messages

When calling `showLoader()`, you can provide custom messages:

```tsx
showLoader("Processing your request...");
showLoader("Loading dashboard...", "loading");
showLoader("Saving changes...", "success");
```

## Troubleshooting

### Loader Not Showing
1. Ensure `useRouteTransition()` is called in your component
2. Check that `RouteTransitionHandler` is included in your layout
3. Verify that `LoaderProvider` wraps your application

### Transitions Not Smooth
1. Check that all pages include the `useRouteTransition()` hook
2. Ensure no direct DOM manipulations are interfering with transitions
3. Verify that CSS transitions are not being overridden

### Flickering Still Occurs
1. Make sure you're not conditionally rendering the loader component
2. Check that the loader is always mounted via `LoaderProvider`
3. Verify that visibility is controlled by CSS, not conditional rendering

### Hydration Errors
1. Ensure all animated elements use deterministic values rather than random generators
2. Predefine positions for all animated particles to ensure SSR/CSR consistency
3. Avoid using `Math.random()` or similar functions in component rendering
4. Use predefined arrays of values instead of runtime random generation

## Performance

The transition system is optimized for performance:
- Single persistent loader instance
- Efficient event handling with proper cleanup
- Minimal re-renders through React context
- CSS-based animations for 60fps performance

## Browser Support

The system works with all modern browsers that support:
- ES6 JavaScript features
- CSS transitions and animations
- React 18+ features
- Next.js App Router

## Future Enhancements

Potential improvements:
- Progressive loader states with percentage indicators
- Integration with data fetching libraries (SWR, React Query)
- Advanced animation timelines with GSAP
- Prefetching optimizations for instant transitions