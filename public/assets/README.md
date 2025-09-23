# Assets Folder

This folder contains custom assets for the EV Bunker application.

## Adding Custom Images

To replace the default favicon and other images:

1. Add your custom favicon as `favicon.ico` in this directory
2. Add your custom logo images with appropriate names:
   - `logo.png` for the main logo
   - `logo-192.png` for mobile icons
   - `logo-512.png` for larger displays
   - `apple-touch-icon.png` for Apple devices
   - `hero-banner.jpg` for the hero section banner

## Image Requirements

### Favicon
- Format: .ico
- Size: 32x32 pixels or 16x16 pixels

### Logo Images
- Format: .png or .svg (with transparent background recommended)
- Recommended sizes:
  - logo.png: 256x256 pixels (will be displayed at 40x40 or 48x48 in UI)
  - logo-192.png: 192x192 pixels
  - logo-512.png: 512x512 pixels
  - apple-touch-icon.png: 180x180 pixels

For best results with the logo:
- Use a transparent background
- Ensure the logo is recognizable at small sizes (40x40 pixels)
- Keep the design simple and clean

### Hero Banner Image
- Format: .jpg or .png
- Recommended size: 1200x600 pixels (2:1 aspect ratio)
- Should be high-quality and represent EV charging

## Usage in Components

To use custom images in your components:

```jsx
// For logos
import Image from 'next/image';
import Logo from '@/public/assets/logo.png';

// In your component
<Image src={Logo} alt="EV Bunker Logo" width={100} height={100} />

// For background images in CSS
// In your CSS file:
background-image: url('/assets/background.jpg');
```

## Current Assets Structure

```
assets/
├── README.md (this file)
├── favicon.ico (add your favicon here)
├── logo.png (add your main logo here)
├── logo-192.png (add your 192x192 logo here)
├── logo-512.png (add your 512x512 logo here)
├── apple-touch-icon.png (add your Apple touch icon here)
└── hero-banner.jpg (add your hero section banner here)
```