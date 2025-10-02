# Custom Assets Guide

This guide explains how to replace the default logos and add custom assets to your EV Bunker application.

## Asset Folder Structure

The assets folder is located at `public/assets/`. This is where you should place all your custom images and icons.

```
public/
└── assets/
    ├── README.md (this guide)
    ├── favicon.ico (add your favicon here)
    ├── logo.png (add your main logo here)
    ├── logo-192.png (add your 192x192 logo here)
    ├── logo-512.png (add your 512x512 logo here)
    ├── apple-touch-icon.png (add your Apple touch icon here)
    └── hero-banner.jpg (add your hero section banner image here)
```

## Steps to Replace Logos

### 1. Prepare Your Assets

Create the following image files:
- `favicon.ico` - Your website favicon (32x32 pixels)
- `logo.png` - Your main logo (recommended 256x256 pixels)
- `logo-192.png` - Medium size logo (192x192 pixels)
- `logo-512.png` - Large logo (512x512 pixels)
- `apple-touch-icon.png` - Apple touch icon (180x180 pixels)
- `hero-banner.jpg` - Hero section banner image (recommended 1200x600 pixels)

### 2. Upload Your Assets

Simply copy your prepared image files into the `public/assets/` folder, replacing any placeholder files.

### 3. Logo Usage in Components

The [Logo](file:///c:/Users/Chiranjeevi%20PK/Desktop/ev-bunker/src/components/ui/Logo.tsx#L13-L38) component has been created for easy logo integration. You can use it in any component like this:

```tsx
import { Logo } from '@/components/ui/Logo';

// In your JSX
<Logo width={40} height={40} />

// For navbar (larger size)
<Logo variant="navbar" />
```

### 4. Favicon Configuration

The favicon is automatically configured in the [layout.tsx](file:///c:/Users/Chiranjeevi%20PK/Desktop/ev-bunker/src/app/layout.tsx#L1-L43) file. Once you add your `favicon.ico` to the assets folder, it will be used automatically.

## Hero Section Banner

The hero section now displays a banner image from `/assets/hero-banner.jpg`. To customize this image:

1. Prepare an image with a recommended size of 1200x600 pixels (2:1 aspect ratio)
2. Save it as `hero-banner.jpg` in the assets folder
3. The image will automatically appear in the hero section

The banner image:
- Has a gradient overlay for better text readability
- Is responsive and works on all device sizes
- Has a subtle border and shadow for depth
- Uses Next.js Image component for optimization

## Logo Size Variants

The Logo component supports different sizes for different contexts:

1. **Default size**: 40x40 pixels (used in most places)
2. **Navbar size**: 48x48 pixels (used in the navigation bar)
3. **Custom size**: Specify width and height props

To use different variants:
```tsx
// Default size
<Logo />

// Navbar variant (larger)
<Logo variant="navbar" />

// Custom size
<Logo width={60} height={60} />
```

## Customizing the Logo Component

The [Logo.tsx](file:///c:/Users/Chiranjeevi%20PK/Desktop/ev-bunker/src/components/ui/Logo.tsx#L13-L38) component is designed to be flexible:

1. **Image-based logo**: By default, it uses `/assets/logo.png`
2. **Text-based logo**: It also includes the text "EV Bunker" as a fallback
3. **Responsive**: The text logo is hidden on small screens

You can customize the component by:
- Changing the image path
- Adjusting the width/height
- Modifying the styling
- Removing the text portion if you only want the image

## Testing Your Changes

After uploading your assets:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Check the following:
   - Favicon in the browser tab
   - Logo in the navigation bar (now larger)
   - Hero section banner image
   - Mobile icons (add to home screen on mobile devices)

## Troubleshooting

If your logos don't appear:

1. **Check file names**: Ensure your files match the expected names exactly
2. **Check file formats**: Use the correct formats (.ico for favicon, .png for images)
3. **Clear cache**: Hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)
4. **Restart server**: Stop and restart your development server

## Additional Assets

You can add any additional images to the assets folder:
- Background images
- Icons
- Illustrations
- Photos

Reference them in your components using:
```tsx
// For component images
import Image from 'next/image';
import MyImage from '@/public/assets/my-image.png';

<Image src={MyImage} alt="Description" />

// For CSS background images
background-image: url('/assets/background.jpg');
```

## Best Practices

1. **Optimize images**: Compress your images for web use
2. **Use appropriate formats**: 
   - .png for logos with transparency
   - .jpg for photographs
   - .svg for vector graphics
3. **Maintain consistent sizing**: Keep logos in standard sizes
4. **Test on all devices**: Check how logos appear on mobile, tablet, and desktop
5. **Logo design tips**:
   - Use a transparent background for maximum flexibility
   - Ensure your logo is recognizable at small sizes
   - Keep the design simple and clean
   - Test your logo on different background colors