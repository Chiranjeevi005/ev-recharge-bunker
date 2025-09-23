# API Loading Indicator Component

A futuristic, theme-oriented loading animation for Electric Vehicle (EV) Recharge Bunk web app, designed to be displayed during API calls.

## Features

- **Theme Consistent**: Semi-dark background with neon accents (cyan → blue → purple) matching the website theme
- **Animated Elements**: Central rotating electric orb with orbiting particles
- **Flexible Display**: Can be used as inline component or full-page overlay
- **Responsive**: Scales appropriately for desktop, tablet, and mobile
- **Customizable**: Supports different sizes and custom messages

## Installation

The component is automatically available after building the project. No additional installation is required.

## Usage

### Basic Usage

```jsx
import { ApiLoadingIndicator } from '@/components/ui/ApiLoadingIndicator';

// Inline loading indicator
<ApiLoadingIndicator />

// Overlay loading indicator
<ApiLoadingIndicator overlay={true} />
```

### With Custom Message

```jsx
<ApiLoadingIndicator message="Fetching charging station data..." />
```

### Different Sizes

```jsx
// Small
<ApiLoadingIndicator size="sm" />

// Medium (default)
<ApiLoadingIndicator size="md" />

// Large
<ApiLoadingIndicator size="lg" />
```

### Complete Example with API Call

```jsx
"use client";

import React, { useState } from 'react';
import { ApiLoadingIndicator } from '@/components/ui/ApiLoadingIndicator';

export default function MyComponent() {
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Your API call here
      await fetch('/api/data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={fetchData} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Fetch Data'}
      </button>
      
      {isLoading && (
        <div className="flex justify-center my-4">
          <ApiLoadingIndicator message="Loading data..." />
        </div>
      )}
    </div>
  );
}
```

### Overlay Example

```jsx
export default function MyComponent() {
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Your API call here
      await fetch('/api/data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={fetchData} disabled={isLoading}>
        Fetch Data
      </button>
      
      {isLoading && (
        <ApiLoadingIndicator 
          overlay={true} 
          message="Processing your request..." 
        />
      )}
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size of the loading indicator |
| `overlay` | `boolean` | `false` | Whether to display as full-page overlay |
| `message` | `string` | `'Loading...'` | Loading message to display |
| `className` | `string` | `''` | Additional CSS classes to apply |

## Design Elements

1. **Central Electric Orb**: A rotating sphere with gradient colors (purple → cyan → blue) that pulses with energy
2. **Orbiting Particles**: Small particles that orbit around the central orb, creating a sense of motion and energy flow
3. **Rotating Rings**: Two concentric rings that rotate at different speeds, creating a layered animation effect
4. **Glow Effects**: Subtle glow and highlight effects that enhance the futuristic appearance
5. **Theme Colors**: Uses the brand colors (cyan → blue → purple) for consistency with the overall design

## Animation Details

- **Continuous Motion**: All animations are smooth and continuous with no abrupt stops
- **Framer Motion**: Uses Framer Motion for high-performance animations
- **Responsive Scaling**: Animations scale appropriately based on the selected size
- **Performance Optimized**: Efficient animations that don't block the UI thread

## Customization

The component can be customized through props:
- Size variations for different use cases
- Custom loading messages for context-specific information
- Overlay mode for full-page loading states
- Additional CSS classes for layout adjustments

## Accessibility

- Proper ARIA attributes
- Semantic HTML structure
- Sufficient color contrast for readability
- Motion-friendly animations

## Browser Support

The component works in all modern browsers that support CSS animations and React.