import { useLoader } from '@/context/LoaderContext';
import { PaymentService } from './payment';
import { connectToDatabase } from '@/lib/db/connection';

interface PaymentOptions {
  onPaymentSuccess?: () => void;
  onPaymentFailure?: (error: string) => void;
}

/**
 * Custom hook for processing payments with the universal loader
 * @returns Object with payment functions and state
 */
export function usePayment() {
  const { showLoader, hideLoader, updateLoader } = useLoader();
  
  const processPayment = async (
    paymentData: any,
    options: PaymentOptions = {}
  ) => {
    const { onPaymentSuccess, onPaymentFailure } = options;
    
    try {
      // Show loading state
      showLoader("Processing payment...", 'loading');
      
      // Create payment order
      const response = await fetch('/api/payment/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }
      
      const orderData = await response.json();
      
      // Return order data and Razorpay initialization function
      return {
        orderData,
        initializeRazorpay: (prefillData: any = {}) => {
          // Initialize Razorpay
          const razorpay = new (window as any).Razorpay({
            key: process.env["NEXT_PUBLIC_RAZORPAY_KEY_ID"] || 'rzp_test_example',
            order_id: orderData.orderId,
            handler: async function (response: any) {
              try {
                // Verify payment
                updateLoader("Verifying payment...", 'loading');
                
                const verifyResponse = await fetch('/api/payment/verify', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                });
                
                if (!verifyResponse.ok) {
                  throw new Error('Payment verification failed');
                }
                
                const verifyData = await verifyResponse.json();
                
                if (verifyData.success) {
                  // Update loader to success state
                  updateLoader("Payment successful!", 'success');
                  
                  // Process successful payment
                  await PaymentService.processSuccessfulPayment(
                    orderData.orderId,
                    response.razorpay_payment_id,
                    paymentData.userId
                  );
                  
                  // Call success callback
                  if (onPaymentSuccess) {
                    onPaymentSuccess();
                  }
                  
                  // Hide loader after delay
                  setTimeout(() => {
                    hideLoader();
                  }, 1500);
                } else {
                  throw new Error('Payment verification failed');
                }
              } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Payment verification failed';
                updateLoader(`Payment failed: ${errorMsg}`, 'error');
                
                // Call failure callback
                if (onPaymentFailure) {
                  onPaymentFailure(errorMsg);
                }
                
                // Hide loader after delay
                setTimeout(() => {
                  hideLoader();
                }, 2000);
              }
            },
            prefill: {
              email: prefillData.email || paymentData.email,
              name: prefillData.name || paymentData.name,
              contact: prefillData.contact || paymentData.contact,
            },
            theme: {
              color: '#10B981',
            },
          });
          
          // Open Razorpay checkout
          razorpay.open();
        }
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Payment processing failed';
      updateLoader(`Payment failed: ${errorMsg}`, 'error');
      
      // Call failure callback
      if (onPaymentFailure) {
        onPaymentFailure(errorMsg);
      }
      
      // Hide loader after delay
      setTimeout(() => {
        hideLoader();
      }, 2000);
      
      throw error;
    }
  };
  
  return { processPayment };
}