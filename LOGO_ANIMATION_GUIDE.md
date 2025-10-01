# Advanced Logo Animation Component Guide

This document explains how to use the enhanced [LogoAnimation](file:///C:/Users/Chiranjeevi%20PK/Desktop/ev-bunker/src/components/ui/LogoAnimation.tsx#L15-L15) component, a sophisticated animation that uses your actual logo with advanced GSAP animations, particle effects, and text animations.

## Component Overview

The [LogoAnimation](file:///C:/Users/Chiranjeevi%20PK/Desktop/ev-bunker/src/components/ui/LogoAnimation.tsx#L15-L15) component provides a professional, brand-consistent animation that treats your logo as the centerpiece of a futuristic energy system. It features complex GSAP animations with multiple visual elements that work together to create a cohesive animated experience.

## Features

### Core Effects

1. **GSAP-Powered Logo Animations**
   - Smooth logo rotation, scaling, and transformation animations
   - Physics-based easing for natural movement
   - State-specific animations for different UI contexts

2. **Dynamic Glow Effects**
   - Pulsing radial gradients that match your brand colors
   - Energy rings that expand and fade
   - State-specific glow intensities

3. **Particle System**
   - Floating particles in brand colors
   - Physics-based movement and fading
   - Burst effects for success states

4. **Animated Text**
   - Gradient text animations
   - State-specific text transitions
   - Optional show/hide functionality

5. **Energy Waves**
   - Expanding concentric rings
   - Color-matched to brand palette
   - Smooth infinite animations

## Installation

The component requires GSAP for animations:

```bash
npm install gsap
```

## Usage

### Basic Import

```tsx
import { LogoAnimation } from '@/components/ui';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `state` | `'loading' | 'success' | 'idle' | 'transition'` | `'idle'` | Animation state |
| `size` | `'sm' | 'md' | 'lg' | 'xl'` | `'md'` | Size of the logo |
| `className` | `string` | `''` | Additional CSS classes |
| `showText` | `boolean` | `false` | Show animated "EV Bunker" text |
| `disableGlow` | `boolean` | `false` | Disable glow effects |
| `disableParticles` | `boolean` | `false` | Disable particle effects |

### Animation States

1. **Loading State**
   - Logo rotation with pulsing glow
   - Expanding energy rings
   - Floating particles
   - Text fade-in with gradient animation

2. **Success State**
   - Logo scale burst
   - Glow expansion burst
   - Particle explosion effect
   - Text pop-in animation

3. **Idle State**
   - Gentle logo breathing (scale)
   - Subtle glow pulsing
   - Slow particle movement
   - Text gentle pulsing

4. **Transition State**
   - Quick logo rotation
   - Glow pulse
   - Text fade effect
   - Particle movement

### Usage Examples

#### Initial Loader
```tsx
<LogoAnimation state="loading" size="lg" showText />
```

#### API Fetching/Loading
```tsx
<LogoAnimation state="idle" size="md" />
```

#### Payment Success / Booking Confirmed
```tsx
<LogoAnimation state="success" size="lg" showText />
```

#### Dashboard Refresh
```tsx
<LogoAnimation state="transition" size="md" />
```

#### Minimal Version
```tsx
<LogoAnimation state="idle" size="md" disableGlow disableParticles />
```

## Technical Implementation

### Frameworks
- React + Tailwind CSS
- GSAP for all animations
- Next.js Image component for optimized logo loading

### Performance
- GPU-accelerated transforms
- Smooth at 60fps
- Efficient animation cleanup
- Optimized particle system

### Theme Consistency
- Color Palette: Brand colors (purple, emerald, teal)
- Animation style: Professional yet futuristic
- Consistent with EV Bunker design system

## Customization

You can customize the component by modifying the following:

1. **Colors**: Adjust the brand color references in the glow and particle effects
2. **Timing**: Modify the GSAP animation durations and delays
3. **Size**: Use the size prop or customize the sizeClasses object
4. **Effects**: Toggle glow, particles, and text display
5. **Particles**: Adjust the number and behavior of particles

## Testing

To test the component, visit `/test-animation` in your browser. This page provides controls to test all animation states, sizes, and options.

## Integration Tips

1. **Loading Screens**: Use the loading state with showText for initial app boot
2. **Buttons**: Use the sm size for loading states in buttons
3. **Success Messages**: Use the success state with showText for confirmation dialogs
4. **Data Refresh**: Use the transition state for pull-to-refresh actions
5. **Dashboard Headers**: Use the idle state for persistent brand presence

## Browser Support

The component uses modern CSS features and requires:
- CSS variables
- CSS gradients
- CSS animations
- CSS transforms

Tested on modern browsers (Chrome, Firefox, Safari, Edge).