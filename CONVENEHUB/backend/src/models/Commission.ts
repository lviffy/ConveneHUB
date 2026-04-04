import { Schema, model } from 'mongoose';

interface CommissionDocument {
  promoterId: string;
  bookingId: string;
  eventId: string;
  referralCode: string;
  amount: number;
  status: 'pending' | 'paid';
}

const commissionSchema = new Schema<CommissionDocument>(
  {
    promoterId: { type: String, required: true },
    bookingId: { type: String, required: true },
    eventId: { type: String, required: true },
    referralCode: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  },
  { timestamps: true }
);

export const CommissionModel = model<CommissionDocument>('Commission', commissionSchema);
