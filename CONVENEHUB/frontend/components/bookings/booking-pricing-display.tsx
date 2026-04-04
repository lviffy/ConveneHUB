'use client';

import { Badge } from '@/components/ui/badge';
import { Ticket, Tag } from 'lucide-react';

interface BookingPricingDisplayProps {
  originalAmount: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string | null;
  ticketsCount?: number;
  className?: string;
}

export default function BookingPricingDisplay({
  originalAmount,
  discountAmount,
  totalAmount,
  couponCode,
  ticketsCount,
  className = '',
}: BookingPricingDisplayProps) {
  const hasCoupon = couponCode && discountAmount > 0;

  return (
    <div className={`bg-gray-50 border rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Ticket className="h-4 w-4" />
        Price Breakdown
      </h3>

      <div className="space-y-2">
        {/* Tickets Count */}
        {ticketsCount && ticketsCount > 1 && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tickets:</span>
            <span>{ticketsCount}x</span>
          </div>
        )}

        {/* Original Amount */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Original Amount:</span>
          <span className={hasCoupon ? 'line-through text-gray-400' : 'font-medium text-gray-900'}>
            ₹{originalAmount.toFixed(2)}
          </span>
        </div>

        {/* Coupon Discount */}
        {hasCoupon && (
          <>
            <div className="flex justify-between items-center text-sm bg-green-50 -mx-2 px-2 py-1.5 rounded">
              <div className="flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-green-600" />
                <span className="text-green-700">Coupon Discount:</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-xs">
                  {couponCode}
                </Badge>
                <span className="font-medium text-green-600">
                  -₹{discountAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Divider */}
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total Amount:</span>
            <span className="text-xl font-bold text-gray-900">
              ₹{totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Savings Message */}
        {hasCoupon && (
          <div className="text-center text-sm text-green-600 font-medium bg-green-50 py-2 rounded">
            🎉 You saved ₹{discountAmount.toFixed(2)}!
          </div>
        )}
      </div>
    </div>
  );
}
