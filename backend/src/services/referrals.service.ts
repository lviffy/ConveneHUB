import { CommissionModel } from '../models/Commission';
import { ReferralLinkModel } from '../models/ReferralLink';

const PROMOTER_COMMISSION_RATE = 0.1;

export interface ReferralAttribution {
  promoterId: string;
  referralCode: string;
}

interface ResolveReferralAttributionInput {
  eventId: string;
  referralCode?: string;
  bookingUserId: string;
}

interface EnsureCommissionInput {
  promoterId: string;
  bookingId: string;
  eventId: string;
  referralCode: string;
  bookingAmount: number;
}

export async function resolveReferralAttribution({
  eventId,
  referralCode,
  bookingUserId,
}: ResolveReferralAttributionInput): Promise<ReferralAttribution | null> {
  const normalized = String(referralCode || '').trim().toUpperCase();
  if (!normalized) {
    return null;
  }

  const referralLink = await ReferralLinkModel.findOne({
    eventId,
    code: normalized,
  }).lean();

  if (!referralLink) {
    return null;
  }

  if (String(referralLink.promoterId) === String(bookingUserId)) {
    return null;
  }

  return {
    promoterId: String(referralLink.promoterId),
    referralCode: String(referralLink.code),
  };
}

export function calculatePromoterCommission(bookingAmount: number) {
  return Number((bookingAmount * PROMOTER_COMMISSION_RATE).toFixed(2));
}

export async function ensureCommissionForBooking({
  promoterId,
  bookingId,
  eventId,
  referralCode,
  bookingAmount,
}: EnsureCommissionInput) {
  const existingCommission = await CommissionModel.findOne({ bookingId }).lean();
  if (existingCommission) {
    return { created: false };
  }

  await CommissionModel.create({
    promoterId,
    bookingId,
    eventId,
    referralCode,
    amount: calculatePromoterCommission(bookingAmount),
    status: 'pending',
  });

  return { created: true };
}

export async function incrementReferralConversion(eventId: string, referralCode: string, promoterId: string) {
  await ReferralLinkModel.updateOne(
    {
      eventId,
      code: referralCode,
      promoterId,
    },
    { $inc: { conversions: 1 } }
  );
}
