const { CommissionModel } = require('../models/Commission');
const { ReferralLinkModel } = require('../models/ReferralLink');

const PROMOTER_COMMISSION_RATE = 0.1;

async function resolveReferralAttribution({ eventId, referralCode, bookingUserId }) {
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

function calculatePromoterCommission(bookingAmount) {
  return Number((bookingAmount * PROMOTER_COMMISSION_RATE).toFixed(2));
}

async function ensureCommissionForBooking({ promoterId, bookingId, eventId, referralCode, bookingAmount }) {
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

async function incrementReferralConversion(eventId, referralCode, promoterId) {
  await ReferralLinkModel.updateOne(
    {
      eventId,
      code: referralCode,
      promoterId,
    },
    { $inc: { conversions: 1 } }
  );
}

module.exports = {
  resolveReferralAttribution,
  calculatePromoterCommission,
  ensureCommissionForBooking,
  incrementReferralConversion,
};
