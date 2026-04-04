'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RazorpayCheckoutProps {
  eventId: string;
  ticketsCount: number;
  couponCode?: string;
  autoTrigger?: boolean;
  onSuccess?: (bookingId: string, paymentId: string) => void;
  onFailure?: (error: string) => void;
  onReady?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayCheckout({
  eventId,
  ticketsCount,
  couponCode,
  autoTrigger = false,
  onSuccess,
  onFailure,
  onReady,
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false);
  const router = useRouter();

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setError('Failed to load payment gateway');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Auto trigger payment when script is loaded and autoTrigger is true
  useEffect(() => {
    if (autoTrigger && scriptLoaded && !hasAutoTriggered && !loading) {
      setHasAutoTriggered(true);
      initiatePayment();
    }
  }, [autoTrigger, scriptLoaded, hasAutoTriggered, loading]);

  const initiatePayment = async () => {
    if (!scriptLoaded) {
      setError('Payment gateway not loaded yet. Please try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[RAZORPAY] Creating order for:', { eventId, ticketsCount, couponCode });

      // Step 1: Create order
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          eventId, 
          ticketsCount,
          couponCode: couponCode || undefined,
        }),
      });

      const orderData = await orderResponse.json();

      console.log('[RAZORPAY] Order response:', {
        ok: orderResponse.ok,
        status: orderResponse.status,
        hasOrderId: !!orderData.orderId,
        error: orderData.error
      });

      if (!orderResponse.ok) {
        throw new Error(orderData.error || orderData.details || 'Failed to create order');
      }

      if (!orderData.orderId) {
        throw new Error('Invalid order response: missing order ID');
      }

      console.log('[RAZORPAY] Opening checkout for order:', orderData.orderId);

      // Step 2: Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ConveneHub Events',
        description: `${orderData.bookingDetails.event.title} - ${ticketsCount} Ticket(s)`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.bookingDetails.name,
          email: orderData.bookingDetails.email,
          contact: orderData.bookingDetails.contact,
        },
        theme: {
          color: '#3B82F6', // Blue color
        },
        handler: async function (response: any) {
          console.log('[RAZORPAY] Payment successful, verifying...');
          await handlePaymentSuccess(response);
        },
        modal: {
          ondismiss: async function () {
            console.log('[RAZORPAY] Payment modal dismissed by user');
            
            // Delete the pending booking directly
            try {
              const deleteResponse = await fetch(`/api/bookings/${orderData.bookingDetails?.booking_id || 'unknown'}`, {
                method: 'DELETE',
              });
              
              if (deleteResponse.ok) {
                console.log('[RAZORPAY] Successfully deleted pending booking');
              } else {
                console.error('[RAZORPAY] Failed to delete booking');
              }
            } catch (err) {
              console.error('[RAZORPAY] Error deleting booking:', err);
            }
            
            setLoading(false);
            setError('Payment cancelled. Your booking has been removed and slots have been released.');
            setShowErrorModal(true);
            onFailure?.('Payment cancelled by user');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      
      // Handle payment failure
      razorpay.on('payment.failed', async function (response: any) {
        console.error('[RAZORPAY] Payment failed:', response.error);
        
        // Call fail endpoint
        try {
          await fetch('/api/payments/fail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: orderData.orderId,
              reason: response.error.reason || 'Payment failed',
              error_code: response.error.code || 'PAYMENT_FAILED',
              error_description: response.error.description || 'Payment processing failed',
            }),
          });
        } catch (err) {
          console.error('[RAZORPAY] Failed to mark payment as failed:', err);
        }
        
        setLoading(false);
        const errorMsg = `Payment failed: ${response.error.description || 'Please try again'}`;
        setError(errorMsg);
        setShowErrorModal(true);
        onFailure?.(errorMsg);
      });
      
      // Notify that Razorpay is ready and about to open
      onReady?.();
      razorpay.open();
    } catch (err: any) {
      console.error('[RAZORPAY] Payment initiation error:', err);
      setError(err.message || 'Failed to initiate payment');
      setShowErrorModal(true);
      setLoading(false);
      onFailure?.(err.message);
    }
  };

  const handlePaymentSuccess = async (response: any) => {
    try {
      console.log('[RAZORPAY] Verifying payment:', {
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id
      });

      // Step 3: Verify payment
      const verifyResponse = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });

      const verifyData = await verifyResponse.json();

      console.log('[RAZORPAY] Verification response:', {
        ok: verifyResponse.ok,
        status: verifyResponse.status,
        success: verifyData.success
      });

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || 'Payment verification failed');
      }

      // Success!
      console.log('[RAZORPAY] Payment completed successfully:', verifyData.booking_id);
      setLoading(false);
      onSuccess?.(verifyData.booking_id, verifyData.payment_id);
      
      // Redirect to bookings page with success message
      router.push(`/bookings?payment=success&booking_id=${verifyData.booking_id}`);
    } catch (err: any) {
      console.error('[RAZORPAY] Payment verification error:', err);
      setError(err.message || 'Payment verification failed');
      setLoading(false);
      onFailure?.(err.message);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="font-medium">Payment Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={initiatePayment}
        disabled={loading || !scriptLoaded}
        style={{ display: autoTrigger ? 'none' : 'flex' }}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        data-razorpay-trigger
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </>
        ) : !scriptLoaded ? (
          'Loading Payment Gateway...'
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            Pay with Razorpay
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Secure payment powered by Razorpay
      </p>

      {/* Error Modal */}
      {showErrorModal && error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => {
                setShowErrorModal(false);
                setError(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Payment Failed
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  {error}
                </p>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowErrorModal(false);
                      setError(null);
                      initiatePayment();
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={() => {
                      setShowErrorModal(false);
                      setError(null);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
