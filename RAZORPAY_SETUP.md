# Razorpay Integration Setup

To enable payment processing in the EV Bunker application, you need to set up Razorpay credentials.

## Steps to get Razorpay API Keys:

1. Go to the [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up or log in to your account
3. Navigate to Settings > API Keys
4. Generate a new API key pair (Key ID and Key Secret)
5. Copy both the Key ID and Key Secret

## Configuration:

Add your API keys to the `.env.local` file:

```
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

Replace `your_razorpay_key_id_here` and `your_razorpay_key_secret_here` with your actual Razorpay credentials.

## Security Notes:

- Never commit your actual API keys to version control
- Keep your Key Secret secure and never expose it in client-side code
- Use environment variables to manage different keys for development and production
- Regularly rotate your API keys for security

## Testing:

Razorpay provides test credentials that you can use during development:
- Test Key ID: `rzp_test_example`
- Test Key Secret: `rzp_test_secret_example`

For more information, refer to the [Razorpay Documentation](https://razorpay.com/docs/).