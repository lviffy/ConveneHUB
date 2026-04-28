const { Router } = require('express');
const { createHmac, randomBytes } = require('crypto');
const Razorpay = require('razorpay');
const { z } = require('zod');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');
const { env } = require('../config/env');
const { EventModel } = require('../models/Event');
const { BookingModel } = require('../models/Booking');
const { TicketModel } = require('../models/Ticket');
const { UserModel } = require('../models/User');
const { PaymentAttemptModel } = require('../models/PaymentAttempt');
const { AttendeeModel } = require('../models/Attendee');
const { ensureCommissionForBooking, incrementReferralConversion, resolveReferralAttribution } = require('../services/referrals.service');

const paymentsRouter = Router();
const PAYMENT_ALLOWED_ROLES = ['attendee', 'admin', 'organizer', 'promoter'];
const PAYMENT_CURRENCY = process.env.PAYMENT_CURRENCY || 'INR';
const PAYMENT_TIMEOUT_MINUTES = Number(process.env.PAYMENT_TIMEOUT_MINUTES || 15);
const MAX_TICKETS_PER_USER = 10;

const createOrderSchema = z.object({ eventId: z.string().min(1), ticketsCount: z.number().int().min(1).max(MAX_TICKETS_PER_USER), tierName: z.string().min(1).optional(), tier_name: z.string().min(1).optional(), referralCode: z.string().optional(), referral_code: z.string().optional() }).transform((data) => ({ eventId: data.eventId, ticketsCount: data.ticketsCount, tierName: data.tierName || data.tier_name, referralCode: data.referralCode || data.referral_code }));
const verifyPaymentSchema = z.object({ razorpay_order_id: z.string().min(1), razorpay_payment_id: z.string().min(1), razorpay_signature: z.string().min(1) });
const failPaymentSchema = z.object({ razorpay_order_id: z.string().min(1), reason: z.string().optional(), error_code: z.string().optional(), error_description: z.string().optional() });

let _razorpay = null;
function getRazorpay() {
  if (!_razorpay) { _razorpay = new Razorpay({ key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'placeholder', key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder' }); }
  return _razorpay;
}

function generateBookingCode() { return randomBytes(4).toString('hex').toUpperCase(); }
function generateTicketCode(length = 8) { return randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length).toUpperCase(); }
function verifyPaymentSignature(orderId, paymentId, signature) { const secret = process.env.RAZORPAY_KEY_SECRET; if (!secret) return false; const expected = createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex'); return expected === signature; }

async function syncAttendeeRecord(eventId, attendeeId) { const activeBookings = await BookingModel.find({ eventId, attendeeId, bookingStatus: 'confirmed' }).sort({ createdAt: 1 }).lean(); if (activeBookings.length === 0) { await AttendeeModel.findOneAndDelete({ eventId, attendeeId }); return; } const bookingIds = activeBookings.map((b) => String(b._id)); const tickets = await TicketModel.find({ bookingId: { $in: bookingIds } }).sort({ createdAt: 1 }).lean(); const primaryTicket = tickets[0]; await AttendeeModel.findOneAndUpdate({ eventId, attendeeId }, { eventId, attendeeId, qrCode: primaryTicket?.qrPayload || activeBookings[0].bookingCode, checkInStatus: tickets.some((t) => t.checkInStatus === 'checked_in') ? 'checked_in' : 'pending' }, { upsert: true, new: true, setDefaultsOnInsert: true }); }

paymentsRouter.post('/create-order', requireAuth, requireRole(...PAYMENT_ALLOWED_ROLES), async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid payment request' });
  if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return res.status(500).json({ error: 'Razorpay is not configured on the backend.' });
  const { eventId, ticketsCount, tierName, referralCode } = parsed.data;
  const userId = req.user.sub;
  const event = await EventModel.findById(eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (event.status !== 'published') return res.status(400).json({ error: 'Event is not open for booking' });
  const tier = (tierName ? event.ticketTiers.find((e) => e.name.toLowerCase() === tierName.toLowerCase()) : null) || event.ticketTiers[0];
  if (!tier) return res.status(400).json({ error: 'Event does not have a valid ticket tier' });
  const tierRemaining = tier.quantity - tier.soldCount;
  if (tierRemaining < ticketsCount || event.remaining < ticketsCount) return res.status(400).json({ error: 'Not enough tickets available' });
  const referralAttribution = await resolveReferralAttribution({ eventId: String(event._id), referralCode, bookingUserId: userId });
  const existingConfirmedBooking = await BookingModel.findOne({ eventId, attendeeId: userId, bookingStatus: 'confirmed' }).lean();
  if (existingConfirmedBooking) return res.status(409).json({ error: 'You already have a booking for this event.', existing_booking: { booking_id: String(existingConfirmedBooking._id), current_tickets: existingConfirmedBooking.ticketsCount, can_add_more: false, booking_status: existingConfirmedBooking.bookingStatus, payment_status: existingConfirmedBooking.paymentStatus || 'paid' } });
  const existingPendingAttempt = await PaymentAttemptModel.findOne({ userId, eventId, status: 'created', expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
  const user = await UserModel.findById(userId).lean();
  const attendeeName = user?.fullName || user?.email?.split('@')[0] || 'Attendee';
  const amount = Number((tier.price * ticketsCount).toFixed(2));
  if (existingPendingAttempt) {
    const isSameRequest = existingPendingAttempt.tierName === tier.name && existingPendingAttempt.ticketsCount === ticketsCount && Number(existingPendingAttempt.amount) === amount;
    if (!isSameRequest) { existingPendingAttempt.status = 'cancelled'; await existingPendingAttempt.save(); }
    else { existingPendingAttempt.referralCode = referralAttribution?.referralCode; existingPendingAttempt.promoterId = referralAttribution?.promoterId; existingPendingAttempt.attributedAt = referralAttribution ? new Date() : undefined; await existingPendingAttempt.save(); return res.json({ success: true, keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, orderId: existingPendingAttempt.razorpayOrderId, amount: Math.round(existingPendingAttempt.amount * 100), currency: PAYMENT_CURRENCY, bookingDetails: { booking_id: String(existingPendingAttempt._id), booking_code: existingPendingAttempt.bookingCode, name: attendeeName, email: user?.email || '', contact: user?.phone || '', event: { id: eventId, title: event.title, ticketsCount: existingPendingAttempt.ticketsCount, totalAmount: existingPendingAttempt.amount, tierName: existingPendingAttempt.tierName } }, expiresAt: existingPendingAttempt.expiresAt, isExisting: true }); }
  }
  await PaymentAttemptModel.updateMany({ userId, eventId, status: 'created', expiresAt: { $lte: new Date() } }, { $set: { status: 'expired' } });
  const amountInPaise = Math.round(amount * 100);
  const bookingCode = generateBookingCode();
  let razorpayOrder;
  try { razorpayOrder = await getRazorpay().orders.create({ amount: amountInPaise, currency: PAYMENT_CURRENCY, receipt: `${eventId}-${userId}`.slice(0, 40), notes: { event_id: eventId, user_id: userId, tickets_count: String(ticketsCount), booking_code: bookingCode, tier_name: tier.name, referral_code: referralAttribution?.referralCode || '', promoter_id: referralAttribution?.promoterId || '' } }); } catch (error) { return res.status(500).json({ error: error?.error?.description || error?.message || 'Failed to create Razorpay order' }); }
  const expiresAt = new Date(Date.now() + PAYMENT_TIMEOUT_MINUTES * 60 * 1000);
  await PaymentAttemptModel.create({ userId, eventId, tierName: tier.name, ticketPrice: tier.price, ticketsCount, amount, bookingCode, referralCode: referralAttribution?.referralCode, promoterId: referralAttribution?.promoterId, attributedAt: referralAttribution ? new Date() : undefined, razorpayOrderId: razorpayOrder.id, status: 'created', expiresAt });
  return res.json({ success: true, keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, orderId: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency, bookingDetails: { booking_id: razorpayOrder.id, booking_code: bookingCode, name: attendeeName, email: user?.email || '', contact: user?.phone || '', event: { id: eventId, title: event.title, ticketsCount, totalAmount: amount, tierName: tier.name } }, expiresAt });
});

paymentsRouter.post('/verify', requireAuth, requireRole(...PAYMENT_ALLOWED_ROLES), async (req, res) => {
  const parsed = verifyPaymentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid payment verification payload' });
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;
  const userId = req.user.sub;
  const attempt = await PaymentAttemptModel.findOne({ razorpayOrderId: razorpay_order_id });
  if (!attempt) return res.status(404).json({ error: 'Payment attempt not found' });
  if (attempt.userId !== userId) return res.status(403).json({ error: 'Forbidden' });
  if (attempt.status === 'paid') {
    const existingBooking = await BookingModel.findOne({ eventId: attempt.eventId, attendeeId: userId, bookingCode: attempt.bookingCode });
    if (existingBooking && attempt.promoterId && attempt.referralCode) {
      if (!existingBooking.promoterId || !existingBooking.referralCode) { existingBooking.promoterId = attempt.promoterId; existingBooking.referralCode = attempt.referralCode; await existingBooking.save(); }
      const commissionResult = await ensureCommissionForBooking({ promoterId: attempt.promoterId, bookingId: String(existingBooking._id), eventId: attempt.eventId, referralCode: attempt.referralCode, bookingAmount: existingBooking.amount });
      if (commissionResult.created) { await incrementReferralConversion(attempt.eventId, attempt.referralCode, attempt.promoterId); }
    }
    return res.json({ success: true, message: 'Payment already verified', booking_id: existingBooking ? String(existingBooking._id) : attempt.razorpayOrderId, booking_code: attempt.bookingCode, payment_id: attempt.razorpayPaymentId || razorpay_payment_id });
  }
  if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) return res.status(400).json({ error: 'Payment signature verification failed' });
  let razorpayPayment;
  try { razorpayPayment = await getRazorpay().payments.fetch(razorpay_payment_id); } catch (error) { return res.status(500).json({ error: error?.error?.description || error?.message || 'Failed to fetch payment from Razorpay' }); }
  if (razorpayPayment.order_id !== razorpay_order_id) return res.status(400).json({ error: 'Payment order mismatch' });
  if (razorpayPayment.status !== 'captured' && razorpayPayment.status !== 'authorized') return res.status(400).json({ error: `Payment status is ${razorpayPayment.status}` });
  const event = await EventModel.findById(attempt.eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  const tier = event.ticketTiers.find((e) => e.name === attempt.tierName) || event.ticketTiers[0];
  if (!tier) return res.status(400).json({ error: 'Ticket tier no longer exists' });
  const tierRemaining = tier.quantity - tier.soldCount;
  if (tierRemaining < attempt.ticketsCount || event.remaining < attempt.ticketsCount) { attempt.status = 'failed'; attempt.razorpayPaymentId = razorpay_payment_id; attempt.razorpaySignature = razorpay_signature; await attempt.save(); return res.status(409).json({ error: 'Tickets are no longer available for this event' }); }
  let booking = await BookingModel.findOne({ eventId: attempt.eventId, attendeeId: userId, bookingCode: attempt.bookingCode });
  if (!booking) {
    booking = await BookingModel.create({ eventId: attempt.eventId, attendeeId: userId, tierName: tier.name, ticketPrice: attempt.ticketPrice, ticketsCount: attempt.ticketsCount, amount: attempt.amount, bookingCode: attempt.bookingCode, bookingStatus: 'confirmed', paymentStatus: 'paid', referralCode: attempt.referralCode, promoterId: attempt.promoterId });
    event.remaining -= attempt.ticketsCount; tier.soldCount += attempt.ticketsCount; await event.save();
    for (let i = 0; i < attempt.ticketsCount; i += 1) { const ticket = new TicketModel({ bookingId: String(booking._id), eventId: attempt.eventId, attendeeId: userId, qrPayload: 'pending', checkInStatus: 'pending', type: tier.name, price: attempt.ticketPrice, quantity: 1 }); ticket.qrPayload = JSON.stringify({ ticketId: String(ticket._id), eventId: attempt.eventId, bookingId: String(booking._id), attendeeId: userId, ticketCode: generateTicketCode() }); await ticket.save(); }
    await syncAttendeeRecord(attempt.eventId, userId);
  } else if (attempt.promoterId && attempt.referralCode && (!booking.promoterId || !booking.referralCode)) { booking.promoterId = attempt.promoterId; booking.referralCode = attempt.referralCode; await booking.save(); }
  if (attempt.promoterId && attempt.referralCode) { const commissionResult = await ensureCommissionForBooking({ promoterId: attempt.promoterId, bookingId: String(booking._id), eventId: attempt.eventId, referralCode: attempt.referralCode, bookingAmount: booking.amount }); if (commissionResult.created) { await incrementReferralConversion(attempt.eventId, attempt.referralCode, attempt.promoterId); } }
  attempt.status = 'paid'; attempt.razorpayPaymentId = razorpay_payment_id; attempt.razorpaySignature = razorpay_signature; await attempt.save();
  return res.json({ success: true, message: 'Payment verified successfully', booking_id: String(booking._id), booking_code: booking.bookingCode, payment_id: razorpay_payment_id });
});

paymentsRouter.post('/fail', requireAuth, requireRole(...PAYMENT_ALLOWED_ROLES), async (req, res) => {
  const parsed = failPaymentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid payment failure payload' });
  const { razorpay_order_id } = parsed.data;
  const userId = req.user.sub;
  const attempt = await PaymentAttemptModel.findOne({ razorpayOrderId: razorpay_order_id });
  if (!attempt) return res.status(404).json({ error: 'Payment attempt not found' });
  if (attempt.userId !== userId) return res.status(403).json({ error: 'Forbidden' });
  if (attempt.status === 'paid') return res.status(400).json({ error: 'Payment already completed' });
  attempt.status = 'failed'; await attempt.save();
  return res.json({ success: true, message: 'Payment attempt marked as failed' });
});

module.exports = { paymentsRouter };
