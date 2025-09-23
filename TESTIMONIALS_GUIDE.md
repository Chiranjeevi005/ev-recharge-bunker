# Testimonials Section Guide

This document explains the implementation and customization of the Testimonials section in the EV Bunker application.

## Component Structure

The Testimonials section consists of:

1. **[TestimonialsSection.tsx](file:///c:/Users/Chiranjeevi%20PK/Desktop/ev-bunker/src/components/landing/TestimonialsSection.tsx#L10-L159)** - Main component that manages the slider functionality
2. **[TestimonialCard.tsx](file:///c:/Users/Chiranjeevi%20PK/Desktop/ev-bunker/src/components/ui/TestimonialCard.tsx#L10-L31)** - Custom card component with enhanced styling
3. **Auto-slider functionality** - Automatically rotates testimonials every 5 seconds

## Features

### Auto-Sliding Carousel
- Testimonials automatically rotate every 5 seconds
- Smooth animations between testimonials
- Manual navigation controls available

### Enhanced Animations
- Star ratings animate in sequence
- Testimonials slide in with fade effects
- Hover effects on interactive elements
- Background decorative elements with blur effects

### Professional Design
- Theme-consistent color scheme using purple/emerald gradients
- Glassmorphism effect with backdrop blur
- Responsive layout for all device sizes
- Elegant typography and spacing

## Customization

### Adding/Modifying Testimonials
To add or modify testimonials, update the `testimonials` array in [TestimonialsSection.tsx](file:///c:/Users/Chiranjeevi%20PK/Desktop/ev-bunker/src/components/landing/TestimonialsSection.tsx#L10-L159):

```typescript
const testimonials = [
  {
    id: 1,
    name: "User Name",
    role: "User Role",
    content: "Testimonial content here...",
    rating: 5, // 1-5 stars
  },
  // ... more testimonials
];
```

### Styling
The component uses:
- Gradient backgrounds with theme colors
- Glassmorphism effects with backdrop blur
- Subtle shadows and hover effects
- Decorative elements with blur for depth

### Animation Controls
Animations are powered by Framer Motion:
- Entry/exit animations for testimonials
- Staggered animations for star ratings
- Hover and tap animations for interactive elements

## Technical Details

### Dependencies
- Framer Motion for animations
- Tailwind CSS for styling

### Responsive Behavior
- Single column layout on mobile
- Larger text sizes on bigger screens
- Appropriate padding for different screen sizes

### Performance
- Efficient rendering with AnimatePresence
- Viewport-based animations (only animate when in view)
- Optimized transitions