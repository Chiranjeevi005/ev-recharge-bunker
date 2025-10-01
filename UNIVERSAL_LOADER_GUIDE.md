# Universal Loader Component Guide

This document explains how to use the [UniversalLoader](file:///C:/Users/Chiranjeevi%20PK/Desktop/ev-bunker/src/components/ui/UniversalLoader.tsx#L11-L11) component, a futuristic, logo-centric loading animation built with GSAP for the EV Bunker application.

## Component Overview

The [UniversalLoader](file:///C:/Users/Chiranjeevi%20PK/Desktop/ev-bunker/src/components/ui/UniversalLoader.tsx#L11-L11) component provides a sophisticated loading animation that focuses on the EV Bunker logo with sharp edge tracing, glowing shards, and energy flow effects. It features dynamic text handling and multiple animation states.

## Features

### Core Features

1. **Logo-Centric Animation**
   - Uses SVG paths of the EV Bunker logo for precise animation
   - Animates only using the edges, shards, and paths of the logo
   - Focuses on sharp edge tracing, glowing shards, and energy flow

2. **Futuristic Energy Flow**
   - Glowing strokes flowing along the edges of the logo with GSAP's strokeDasharray technique
   - Electric pulses traveling across shards
   - Subtle spark effects at sharp corners
   - Soft gradient sweep inside the logo simulates charging

3. **Universal Loop**
   - Once charging finishes, the animation goes into a "breathing glow" loop
   - Lightweight and reusable for multiple states

4. **Dynamic Text Handling**
   - Futuristic animated text below the logo
   - Text changes dynamically depending on the current task
   - Smooth fade in/out transitions with GSAP
   - Slight glitch/glow effect for a futuristic feel
   - Text color changes based on state (green for success, red for error, default for loading/idle)
   - Text color syncs with the logo glow (blue/teal/white highlights for loading, green for success, red/orange for error)

## Installation

The component requires GSAP for animations:

```bash
npm install gsap
```

## Usage

### Basic Import

```tsx
import { UniversalLoader } from '@/components/ui';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `task` | `string` | `"Loading..."` | Dynamic task text displayed below the logo |
| `state` | `'loading' | 'success' | 'error' | 'idle'` | `'loading'` | Animation state that changes glow effect and text color |
| `size` | `'sm' | 'md' | 'lg' | 'xl'` | `'md'` | Size of the loader |
| `className` | `string` | `''` | Additional CSS classes |

### Usage Examples

#### Basic Usage
```tsx
<UniversalLoader task="Loading..." />
```

#### With Custom Task
```tsx
<UniversalLoader task="Finding Nearby Stations..." size="lg" />
```

#### Small Size
```tsx
<UniversalLoader task="Syncing..." size="sm" />
```

#### Success State
```tsx
<UniversalLoader task="Payment Successful!" state="success" />
```

#### Error State
```tsx
<UniversalLoader task="Retrying..." state="error" />
```

#### Idle State
```tsx
<UniversalLoader task="Ready" state="idle" />
```

#### In API Calls
```tsx
const MyComponent = () => {
  const [loading, setLoading] = useState(false);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // API call here
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {loading ? (
        <UniversalLoader task="Fetching Data..." />
      ) : (
        <Content />
      )}
    </div>
  );
};
```

## Technical Implementation

### Frameworks
- React + Tailwind CSS
- GSAP for all animations

### Performance
- GPU-accelerated transforms
- Smooth at 60fps
- Efficient animation cleanup
- Lightweight and responsive

### Theme Consistency
- Color Palette: 90% light (white, soft gradients) + 10% dark (deep blue/teal shadows)
- Animation style: Sleek, minimal neon futuristic (not cartoonish)
- Matches EV Bunker's brand colors (purple, emerald, teal)

## Customization

You can customize the component by modifying the following:

1. **Colors**: Adjust the gradient colors in the SVG definitions
2. **Timing**: Modify the GSAP animation durations and delays
3. **Size**: Use the size prop or customize the sizeClasses object
4. **Tasks**: Pass different task strings to change the displayed text

## Testing

To test the component, visit `/test-universal-loader` in your browser. This page provides controls to test different sizes and see dynamic task text changes.

## Integration Tips

1. **Loading States**: Use for initial app boot, API calls, and data fetching
2. **Page Transitions**: Use during route changes for smooth transitions
3. **Form Submissions**: Use during form processing and validation
4. **Data Syncing**: Use when syncing data with backend services

## Browser Support

The component uses modern CSS features and requires:
- CSS variables
- CSS gradients
- CSS animations
- SVG support

Tested on modern browsers (Chrome, Firefox, Safari, Edge).

## Component Structure

### File: `src/components/ui/UniversalLoader.tsx`

The main component that implements all the advanced animations using GSAP. Key features include:

- **GSAP Integration**: Uses GSAP for all animations with proper cleanup
- **SVG Path Animation**: Animates individual paths of the logo
- **Dynamic Text**: Updates task text with smooth transitions
- **Performance Optimization**: Efficient animation cleanup and resource management

### Animation Details

1. **Logo Path Animation**
   - Uses strokeDasharray and strokeDashoffset for drawing effects
   - Staggered animations across paths for a cascading effect
   - Color transitions that match the brand palette

2. **Glow Effect**
   - Pulsing radial gradient behind the logo
   - Smooth scale and opacity animations
   - Color changes based on state (purple/teal for loading, green for success, red/orange for error)
   - Color-matched to brand colors

3. **Spark Effects**
   - Floating particles at key points around the logo
   - Random movement patterns
   - Fade in/out animations

4. **Text Animation**
   - Smooth fade in/out transitions
   - Glowing text effect with color transitions
   - Dynamic text updates with proper timing

## Best Practices

1. **Performance**: Only render the loader when actually needed
2. **Accessibility**: Ensure loading states are announced to screen readers
3. **User Experience**: Provide meaningful task descriptions
4. **Consistency**: Use the same loader across the application for a unified experience

## Troubleshooting

### Common Issues

1. **Animations Not Working**
   - Ensure GSAP is properly installed
   - Check that the component is mounted in a client-side context

2. **Text Not Updating**
   - Verify the task prop is being passed correctly
   - Check for proper state management in parent components

3. **Styling Issues**
   - Ensure Tailwind CSS is properly configured
   - Check for CSS conflicts with parent components

### Debugging Tips

1. Use browser dev tools to inspect GSAP animations
2. Check the console for any JavaScript errors
3. Verify all required dependencies are installed
4. Test in different browsers to ensure compatibility

## Future Enhancements

1. **Custom Path Support**: Allow custom SVG paths for different logo variations
2. **Theme Variations**: Add support for different color themes
3. **Animation Presets**: Predefined animation styles for different contexts
4. **Accessibility Features**: Enhanced screen reader support and keyboard navigation
5. **Lottie Integration**: Add Lottie JSON animations for electric shard pulses and spark effects