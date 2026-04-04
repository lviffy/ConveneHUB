import { Schema, model } from 'mongoose';

interface CouponDocument {
  id: number;
  code: string;
  discountType: 'percentage' | 'fixed' | 'free';
  discountValue: number;
  eventIds: string[];
  usageLimit?: number | null;
  perUserLimit: number;
  minTickets: number;
  validFrom?: Date | null;
  validUntil?: Date | null;
  isActive: boolean;
  currentUsageCount: number;
  createdBy?: string;
}

const couponSchema = new Schema<CouponDocument>(
  {
    id: { type: Number, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    discountType: { type: String, enum: ['percentage', 'fixed', 'free'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    eventIds: { type: [String], default: [] },
    usageLimit: { type: Number, default: null },
    perUserLimit: { type: Number, default: 1, min: 1 },
    minTickets: { type: Number, default: 1, min: 1 },
    validFrom: { type: Date, default: null },
    validUntil: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    currentUsageCount: { type: Number, default: 0, min: 0 },
    createdBy: { type: String },
  },
  { timestamps: true }
);

export const CouponModel = model<CouponDocument>('Coupon', couponSchema);