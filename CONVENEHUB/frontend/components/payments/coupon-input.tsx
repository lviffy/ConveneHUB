'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Ticket, Check, X, Loader2, Tag, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CouponInputProps {
  eventId: string;
  ticketsCount: number;
  originalAmount: number;
  onCouponApplied?: (result: CouponValidationResult) => void;
  onCouponRemoved?: () => void;
  disabled?: boolean;
  className?: string;
}

interface CouponValidationResult {
  valid: boolean;
  error?: string;
  coupon_id?: number;
  coupon_code?: string;
  discount_type?: 'percentage' | 'fixed' | 'free';
  discount_value?: number;
  original_amount?: number;
  discount_amount?: number;
  final_amount?: number;
}

export default function CouponInput({
  eventId,
  ticketsCount,
  originalAmount,
  onCouponApplied,
  onCouponRemoved,
  disabled = false,
  className = '',
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { toast } = useToast();

  // Reset validation error when user types
  useEffect(() => {
    if (validationError && couponCode) {
      setValidationError(null);
    }
  }, [couponCode]);

  const handleValidate = async () => {
    if (!couponCode.trim()) {
      setValidationError('Please enter a coupon code');
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponCode: couponCode.trim().toUpperCase(),
          eventId,
          ticketsCount,
          originalAmount,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.valid) {
        setValidationError(result.error || 'Invalid coupon code');
        return;
      }

      // Successfully validated
      setAppliedCoupon(result);
      setValidationError(null);

      if (onCouponApplied) {
        onCouponApplied(result);
      }

      toast({
        title: 'Coupon Applied!',
        description: `You saved ₹${result.discount_amount?.toFixed(2)}`,
      });
    } catch (error) {
      setValidationError('Failed to validate coupon. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemove = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setValidationError(null);

    if (onCouponRemoved) {
      onCouponRemoved();
    }

    toast({
      title: 'Coupon Removed',
      description: 'Original price restored',
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !disabled && !appliedCoupon) {
      handleValidate();
    }
  };

  return (
    <div className={className}>
      {/* Coupon Input Section */}
      {!appliedCoupon ? (
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Have a coupon code?
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter code (e.g., WELCOME50)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              disabled={disabled || isValidating}
              className="font-mono uppercase"
              maxLength={50}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleValidate}
              disabled={disabled || isValidating || !couponCode.trim()}
            >
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Apply
                </>
              )}
            </Button>
          </div>

          {/* Validation Error */}
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
        </div>
      ) : (
        /* Applied Coupon Display */
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Ticket className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-green-900">
                    Coupon Applied
                  </span>
                  <Badge variant="secondary" className="font-mono">
                    {appliedCoupon.coupon_code}
                  </Badge>
                </div>
                <div className="text-sm text-green-700">
                  {appliedCoupon.discount_type === 'percentage' && (
                    <span>{appliedCoupon.discount_value}% discount</span>
                  )}
                  {appliedCoupon.discount_type === 'fixed' && (
                    <span>₹{appliedCoupon.discount_value} off</span>
                  )}
                  {appliedCoupon.discount_type === 'free' && (
                    <span>Free tickets!</span>
                  )}
                  <span className="ml-2 font-medium">
                    • Saved ₹{appliedCoupon.discount_amount?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
              className="text-green-700 hover:text-green-900 hover:bg-green-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Price Breakdown */}
          <div className="mt-3 pt-3 border-t border-green-200 space-y-1 text-sm">
            <div className="flex justify-between text-green-700">
              <span>Original Amount:</span>
              <span className="line-through">₹{appliedCoupon.original_amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-800 font-semibold">
              <span>Discount:</span>
              <span className="text-green-600">
                -₹{appliedCoupon.discount_amount?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-green-900 font-bold text-base pt-1 border-t border-green-200">
              <span>Final Amount:</span>
              <span>₹{appliedCoupon.final_amount?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
