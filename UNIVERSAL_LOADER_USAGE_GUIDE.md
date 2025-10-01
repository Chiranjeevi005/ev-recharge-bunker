# Universal Loader Usage Guide

This document provides comprehensive usage examples and integration guides for the UniversalLoader component and its associated systems.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Loader States](#loader-states)
3. [Global Loader Context](#global-loader-context)
4. [Integration with Authentication](#integration-with-authentication)
5. [Integration with Database Queries](#integration-with-database-queries)
6. [Integration with Payment Processing](#integration-with-payment-processing)
7. [Integration with Map Operations](#integration-with-map-operations)
8. [Custom Hooks](#custom-hooks)
9. [Best Practices](#best-practices)

## Basic Usage

The UniversalLoader component can be used in two ways:

### 1. Direct Component Usage

```tsx
import { UniversalLoader } from '@/components/ui/UniversalLoader';

// Basic usage
<UniversalLoader task="Loading..." />

// With custom size
<UniversalLoader task="Finding Nearby Stations..." size="lg" />

// Small size
<UniversalLoader task="Syncing..." size="sm" />

// With specific state
<UniversalLoader task="Payment Successful!" state="success" size="lg" />
```

### 2. Global Context Usage

Wrap your application with the LoaderProvider in your root layout:

```tsx
// src/app/layout.tsx
import { LoaderProvider } from '@/lib/LoaderContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <LoaderProvider>
            {children}
          </LoaderProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

Then use the useLoader hook in your components:

```tsx
import { useLoader } from '@/lib/LoaderContext';

export default function MyComponent() {
  const { showLoader, hideLoader, updateLoader } = useLoader();
  
  const handleClick = () => {
    showLoader("Processing request...");
    // Your async operation here
    setTimeout(() => {
      updateLoader("Almost done...", "success");
      setTimeout(() => {
        hideLoader();
      }, 1000);
    }, 2000);
  };
  
  return <button onClick={handleClick}>Process</button>;
}
```

## Loader States

The UniversalLoader supports four distinct states:

### Loading State (Default)
```tsx
<UniversalLoader task="Fetching data..." state="loading" />
```
- Purple/teal glow effect
- Continuous animation
- Default text color

### Success State
```tsx
<UniversalLoader task="Payment Successful!" state="success" />
```
- Green glow effect
- Success animation
- Green text color

### Error State
```tsx
<UniversalLoader task="Retrying..." state="error" />
```
- Red/orange glow effect
- Error animation
- Red text color

### Idle State
```tsx
<UniversalLoader task="Ready" state="idle" />
```
- Subtle glow effect
- Minimal animation
- Default text color

## Global Loader Context

The LoaderProvider provides a global context for managing loaders throughout your application.

### Context API

```tsx
interface LoaderContextType {
  isLoading: boolean;
  showLoader: (task: string, state?: 'loading' | 'success' | 'error' | 'idle') => void;
  hideLoader: () => void;
  updateLoader: (task: string, state?: 'loading' | 'success' | 'error' | 'idle') => void;
}
```

### Usage Example

```tsx
'use client';

import { useLoader } from '@/lib/LoaderContext';

export default function MyComponent() {
  const { showLoader, hideLoader, updateLoader } = useLoader();
  
  const handleAsyncOperation = async () => {
    try {
      // Show loader
      showLoader("Processing...");
      
      // Perform async operation
      const result = await someAsyncOperation();
      
      // Update loader for success
      updateLoader("Operation completed!", "success");
      
      // Hide after delay
      setTimeout(() => {
        hideLoader();
      }, 1500);
      
      return result;
    } catch (error) {
      // Update loader for error
      updateLoader("Operation failed", "error");
      
      // Hide after delay
      setTimeout(() => {
        hideLoader();
      }, 2000);
      
      throw error;
    }
  };
  
  return (
    <button onClick={handleAsyncOperation}>
      Process
    </button>
  );
}
```

## Integration with Authentication

The UniversalLoader is integrated with NextAuth.js for authentication flows.

### Login Integration

```tsx
// In your login page
import { useLoader } from '@/lib/LoaderContext';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const { showLoader, hideLoader } = useLoader();
  
  const handleLogin = async (credentials) => {
    showLoader("Signing in...");
    
    try {
      const result = await signIn("credentials", {
        ...credentials,
        redirect: false,
      });
      
      if (result?.error) {
        // Handle error
        hideLoader();
      } else {
        // Success - redirect handled by NextAuth
      }
    } catch (error) {
      hideLoader();
      // Handle error
    }
  };
  
  return (
    // Your login form
  );
}
```

## Integration with Database Queries

Custom hooks are provided for database operations with loader integration.

### Using useDataLoader Hook

```tsx
import { useDataLoader } from '@/hooks/useDataLoader';
import { connectToDatabase } from '@/lib/db/connection';

export default function MyComponent() {
  const { data, loading, error, loadData } = useDataLoader(
    async () => {
      const { db } = await connectToDatabase();
      return await db.collection("stations").find({}).toArray();
    },
    {
      loadingMessage: "Finding charging stations...",
      successMessage: "Stations loaded successfully",
      errorMessage: "Failed to load stations"
    }
  );
  
  return (
    <div>
      <button onClick={loadData} disabled={loading}>
        {loading ? "Loading..." : "Load Stations"}
      </button>
      {error && <div>Error: {error}</div>}
      {data && <div>Found {data.length} stations</div>}
    </div>
  );
}
```

### Using Specific Hooks

```tsx
import { useStations, useBookings, usePayments } from '@/hooks/useDataLoader';

export default function Dashboard() {
  const { stations, loading: stationsLoading, error: stationsError, fetchStations } = useStations();
  const { bookings, loading: bookingsLoading, error: bookingsError, fetchBookings } = useBookings(userId);
  const { payments, loading: paymentsLoading, error: paymentsError, fetchPayments } = usePayments(userId);
  
  useEffect(() => {
    fetchStations();
    if (userId) {
      fetchBookings();
      fetchPayments();
    }
  }, [userId]);
  
  return (
    // Your dashboard content
  );
}
```

## Integration with Payment Processing

The UniversalLoader is integrated with Razorpay for payment processing.

### Using usePayment Hook

```tsx
import { usePayment } from '@/lib/paymentWithLoader';

export default function PaymentComponent() {
  const { processPayment } = usePayment();
  
  const handlePayment = async () => {
    try {
      const { orderData, initializeRazorpay } = await processPayment(
        {
          stationId: "station123",
          slotId: "slot456",
          duration: 2,
          amount: 100,
          userId: "user789"
        },
        {
          onPaymentSuccess: () => {
            console.log("Payment successful!");
            // Handle success (e.g., redirect to confirmation page)
          },
          onPaymentFailure: (error) => {
            console.error("Payment failed:", error);
            // Handle failure
          }
        }
      );
      
      // Initialize Razorpay checkout
      initializeRazorpay({
        email: "user@example.com",
        name: "John Doe"
      });
    } catch (error) {
      console.error("Payment processing failed:", error);
    }
  };
  
  return (
    <button onClick={handlePayment}>
      Pay Now
    </button>
  );
}
```

## Integration with Map Operations

The UniversalLoader is integrated with Maplibre for mapping operations.

### Using useMapLoader Hook

```tsx
import { useMapLoader } from '@/lib/mapWithLoader';

export default function MapComponent() {
  const { findNearbyStations, reserveSlot } = useMapLoader();
  
  const handleFindStations = async () => {
    try {
      const stations = await findNearbyStations({
        lat: 28.613939,
        lng: 77.209021
      });
      
      // Update map with stations
      updateMapWithStations(stations);
    } catch (error) {
      console.error("Failed to find stations:", error);
    }
  };
  
  const handleReserveSlot = async (stationId, slotId) => {
    try {
      const booking = await reserveSlot(stationId, slotId);
      
      // Handle successful reservation
      showBookingConfirmation(booking);
    } catch (error) {
      console.error("Failed to reserve slot:", error);
    }
  };
  
  return (
    // Your map component
  );
}
```

## Custom Hooks

Several custom hooks are provided for common use cases:

### useDataLoader

A generic hook for loading any data with loader integration:

```tsx
const { data, loading, error, loadData } = useDataLoader(
  async () => {
    // Your async operation
    return await fetchData();
  },
  {
    loadingMessage: "Loading data...",
    successMessage: "Data loaded successfully",
    errorMessage: "Failed to load data"
  }
);
```

### useStations

Specific hook for loading charging stations:

```tsx
const { stations, loading, error, fetchStations } = useStations();
```

### useBookings

Specific hook for loading user bookings:

```tsx
const { bookings, loading, error, fetchBookings } = useBookings(userId);
```

### usePayments

Specific hook for loading payment history:

```tsx
const { payments, loading, error, fetchPayments } = usePayments(userId);
```

### usePayment

Hook for processing payments:

```tsx
const { processPayment } = usePayment();
```

### useMapLoader

Hook for map operations:

```tsx
const { loadMapData, findNearbyStations, reserveSlot } = useMapLoader();
```

## Best Practices

### 1. Consistent Messaging

Use clear, descriptive messages that inform users about what's happening:

```tsx
// Good
showLoader("Finding nearby charging stations...");

// Avoid
showLoader("Loading...");
```

### 2. Appropriate States

Use the correct state for different scenarios:

```tsx
// Success
updateLoader("Payment successful!", "success");

// Error
updateLoader("Connection failed. Retrying...", "error");

// Loading
showLoader("Processing your request...");
```

### 3. Proper Cleanup

Always hide the loader after operations complete:

```tsx
try {
  showLoader("Processing...");
  await operation();
  updateLoader("Completed!", "success");
  setTimeout(() => hideLoader(), 1500);
} catch (error) {
  updateLoader("Failed", "error");
  setTimeout(() => hideLoader(), 2000);
}
```

### 4. Error Handling

Provide meaningful error messages:

```tsx
try {
  showLoader("Saving changes...");
  await saveChanges();
  updateLoader("Changes saved successfully!", "success");
} catch (error) {
  updateLoader(`Save failed: ${error.message}`, "error");
}
```

### 5. Performance Considerations

- Use the global loader context to avoid multiple loader instances
- Hide loaders promptly after operations complete
- Use appropriate delays to ensure users see success/error states

## Testing

The UniversalLoader component includes comprehensive tests:

```tsx
// tests/universal-loader.test.tsx
import { render, screen } from '@testing-library/react';
import { UniversalLoader } from '../src/components/ui/UniversalLoader';

describe('UniversalLoader', () => {
  test('renders without crashing', () => {
    render(React.createElement(UniversalLoader, null));
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('displays custom task text', () => {
    render(React.createElement(UniversalLoader, { task: "Processing payment..." }));
    expect(screen.getByText('Processing payment...')).toBeInTheDocument();
  });

  // Additional tests...
});
```

## Conclusion

The UniversalLoader system provides a consistent, branded loading experience throughout your application. By following these guidelines and using the provided hooks and context, you can ensure a smooth, professional user experience during all asynchronous operations.