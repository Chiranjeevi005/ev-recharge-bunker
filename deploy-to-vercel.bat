@echo off
echo ========================================
echo EV Bunker - Vercel Deployment Helper
echo ========================================
echo.

echo This script provides guidance for deploying to Vercel.
echo.

echo 1. Ensure you have the Vercel CLI installed:
echo    npm install -g vercel
echo.

echo 2. Login to Vercel:
echo    vercel login
echo.

echo 3. Deploy to Vercel:
echo    vercel --prod
echo.

echo Before deploying, make sure you have set the following environment variables in Vercel:
echo - DATABASE_URL
echo - NEXTAUTH_SECRET
echo - NEXTAUTH_URL
echo - REDIS_URL (optional)
echo - RAZORPAY_KEY_ID
echo - RAZORPAY_KEY_SECRET
echo - NEXT_PUBLIC_RAZORPAY_KEY_ID
echo - ARCJET_KEY
echo.

echo For detailed instructions, see VERCEL_DEPLOYMENT_GUIDE.md
echo.

pause