import { Schema, model } from 'mongoose';

interface ReferralLinkDocument {
  promoterId: string;
  eventId: string;
  code: string;
  clicks: number;
  conversions: number;
}

const referralLinkSchema = new Schema<ReferralLinkDocument>(
  {
    promoterId: { type: String, required: true },
    eventId: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ReferralLinkModel = model<ReferralLinkDocument>('ReferralLink', referralLinkSchema);
