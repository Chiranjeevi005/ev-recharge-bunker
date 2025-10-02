# Google Maps API Setup

To enable the interactive map functionality in the EV Bunker application, you need to set up a Google Maps API key.

## Steps to get Google Maps API Key:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security
6. Copy the API key

## Configuration:

Add your API key to the `.env.local` file:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with your actual Google Maps API key.

## Security Notes:

- Never commit your actual API key to version control
- Always restrict your API key to specific domains
- Monitor your API usage in the Google Cloud Console