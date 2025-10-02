# Payment Confirmation Page

## Overview
The confirmation page is displayed after a successful payment for booking an EV charging slot. It provides users with a detailed summary of their booking, including station information, booking details, schedule, and payment information.

## URL Structure
```
http://localhost:3002/confirmation?bookingId=68da64b4fd56ff9c7c8119ce
```

## Features
1. **Success Animation** - Visual confirmation of successful payment
2. **Booking Details** - Comprehensive information about the booking
3. **Station Information** - Details about the charging station
4. **Schedule Information** - Start and end times for the booking
5. **Payment Details** - Payment ID and status
6. **Action Buttons** - Navigate to dashboard or book another slot

## Design Elements
- **Futuristic Theme** - Uses the project's color palette with gradients from purple to emerald
- **Responsive Layout** - Works on all device sizes
- **Animated Transitions** - Smooth animations for better user experience
- **Professional Aesthetics** - Clean, modern design with appropriate spacing and typography

## Data Displayed
1. **Booking Confirmation Header**
   - Success animation
   - "Payment Successful!" heading
   - "Your booking has been confirmed" subheading

2. **Booking Details Card**
   - Booking ID
   - Confirmation status badge
   - Station details (name, address, city)
   - Booking information (slot ID, duration, amount paid)
   - Schedule (start time, end time)
   - Payment details (payment ID, status)

3. **Action Buttons**
   - "View Dashboard" - Navigates to client dashboard
   - "Book Another Slot" - Navigates to find bunks page

## Technical Implementation
- Built with Next.js and React
- Uses TypeScript for type safety
- Implements Framer Motion for animations
- Responsive design with Tailwind CSS
- Fetches data from `/api/bookings` and `/api/stations` endpoints
- Handles loading and error states gracefully

## Error Handling
- Displays appropriate error messages when booking ID is missing
- Shows error state when booking is not found
- Handles API fetch errors gracefully

## User Experience
- Clear visual confirmation of successful payment
- All relevant booking information displayed in an organized manner
- Easy navigation to next steps
- Professional and aesthetically pleasing design