# Google OAuth Setup Guide

This guide explains how to set up Google OAuth for the EV Bunker application.

## Prerequisites

1. A Google account
2. Access to the Google Cloud Console

## Steps to Set Up Google OAuth

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" then "New Project"
3. Enter a project name (e.g., "EV Bunker")
4. Click "Create"

### 2. Enable the Google+ API

1. In the Google Cloud Console, make sure your project is selected
2. Navigate to "APIs & Services" > "Library"
3. Search for "Google+ API"
4. Click on "Google+ API" and then click "Enable"

### 3. Create OAuth 2.0 Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Set User Type to "External"
   - Enter an App name (e.g., "EV Bunker")
   - Enter your email as the User support email
   - Enter your email as the Developer contact information
   - Click "Save and Continue" through all steps
4. For Application type, select "Web application"
5. Enter a name for the client (e.g., "EV Bunker Web Client")
6. Under "Authorized redirect URIs", add:
   - `http://localhost:3002/api/auth/callback/google` (for development)
   - Your production URL when deploying (e.g., `https://yourdomain.com/api/auth/callback/google`)
7. Click "Create"

### 4. Configure Environment Variables

After creating the OAuth client, you'll receive a Client ID and Client Secret. Add these to your `.env` file:

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 5. Test the Setup

1. Restart your development server
2. Navigate to the login page
3. Click "Login with Google"
4. You should be redirected to Google's OAuth screen

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" Error**
   - Make sure the redirect URIs in the Google Cloud Console exactly match the ones your application uses
   - Include both `http://` and `https://` versions if needed

2. **"Unauthorized redirect URI"**
   - Ensure all redirect URIs are added to the Google Cloud Console
   - URIs must be exact matches, including trailing slashes

3. **OAuth Consent Screen Not Verified**
   - For development, you can add test users to bypass verification
   - For production, you'll need to go through Google's verification process

## Security Best Practices

1. **Keep Secrets Secure**
   - Never commit client secrets to version control
   - Use environment variables for all secrets

2. **Use HTTPS in Production**
   - Always use HTTPS for OAuth redirect URIs in production

3. **Limit Scopes**
   - Only request the minimum scopes required for your application
   - The default setup only requests basic profile information

4. **Regular Rotation**
   - Periodically rotate your client secrets
   - Update environment variables accordingly