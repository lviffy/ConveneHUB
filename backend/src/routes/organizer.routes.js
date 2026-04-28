const { Router } = require('express');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');
const { EventModel } = require('../models/Event');
const { BookingModel } = require('../models/Booking');
const { CheckInModel } = require('../models/CheckIn');
const { TicketModel } = require('../models/Ticket');
const { UserModel } = require('../models/User');

const organizerRouter = Router();

function mapEventStatus(status) {
  if (status === 'closed') return 'ended';
  return status || 'draft';
}

function toMoney(value) {
  return Number(value.toFixed(2));
}

async function loadOrganizerEvent(actorId, eventId) {
  const event = await EventModel.findById(eventId);
  if (!event) return null;
  if (event.organizerId !== actorId) return 'forbidden';
  return event;
}

function mapCheckinStatus(status) {
  if (status === 'published') return 'checkin_open';
  if (status === 'checkin_open' || status === 'in_progress' || status === 'ended') return status;
  return null;
}

organizerRouter.get('/my-events', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  const actorId = req.user?.sub;
  if (!actorId) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const events = await EventModel.find({ organizerId: actorId }).sort({ dateTime: 1 }).lean();
  if (events.length === 0) return res.json({ success: true, events: [] });
  const eventIds = events.map((e) => String(e._id));
  const bookings = await BookingModel.find({ eventId: { $in: eventIds }, bookingStatus: { $ne: 'cancelled' } }).select('eventId ticketsCount').lean();
  const soldByEventId = new Map();
  for (const booking of bookings) { const id = String(booking.eventId || ''); soldByEventId.set(id, (soldByEventId.get(id) || 0) + (booking.ticketsCount || 1)); }
  const payload = events.map((event) => { const eid = String(event._id); const sold = soldByEventId.get(eid) || 0; return { event_id: eid, title: event.title, description: event.description || '', venue_name: event.venue || '', venue_address: event.venue || '', city: event.city || '', date_time: event.dateTime, capacity: event.capacity, remaining: Math.max(0, event.capacity - sold), status: event.status, assigned_at: event.createdAt }; });
  return res.json({ success: true, events: payload });
});

organizerRouter.get('/events', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  const actorId = req.user?.sub;
  if (!actorId) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const statusQuery = typeof req.query.status === 'string' ? req.query.status : '';
  const requested = statusQuery.split(',').map((s) => s.trim()).filter(Boolean);
  const statusMap = { draft: 'draft', published: 'published', checkin_open: 'checkin_open', in_progress: 'in_progress', ended: 'ended', closed: 'ended' };
  const mappedStatuses = Array.from(new Set(requested.map((s) => statusMap[s]).filter(Boolean)));
  const query = { organizerId: actorId };
  if (mappedStatuses.length > 0) query.status = { $in: mappedStatuses };
  const events = await EventModel.find(query).sort({ dateTime: 1 }).lean();
  return res.json({ success: true, events: events.map((e) => ({ event_id: String(e._id), title: e.title, date_time: e.dateTime, status: mapEventStatus(e.status) })) });
});

organizerRouter.get('/financial-summary', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  const actorId = req.user?.sub;
  if (!actorId) return res.status(401).json({ error: 'Unauthorized' });
  const PFP = 0, PCP = 10;
  const events = await EventModel.find({ organizerId: actorId, status: { $in: ['published', 'checkin_open', 'in_progress', 'ended', 'closed'] } }).sort({ dateTime: -1 }).lean();
  if (events.length === 0) return res.json({ success: true, events: [], summary: { total_events: 0, total_tickets_sold: 0, total_gross_revenue: 0, total_processing_fees: 0, total_platform_commission: 0, total_net_payout: 0 }, fee_structure: { processing_fee_percentage: PFP, platform_commission_note: 'Commission percentage varies per event' } });
  const eventIds = events.map((e) => String(e._id));
  const bookings = await BookingModel.find({ eventId: { $in: eventIds }, bookingStatus: 'confirmed' }).sort({ createdAt: -1 }).lean();
  const eventsPayload = events.map((event) => {
    const eid = String(event._id); const eb = bookings.filter((b) => b.eventId === eid);
    const tb = eb.length, tts = eb.reduce((s, b) => s + b.ticketsCount, 0), gr = eb.reduce((s, b) => s + b.amount, 0);
    const pf = (gr * PFP) / 100, pc = (gr * PCP) / 100, np = gr - pf - pc;
    return { event_id: eid, title: event.title, date_time: event.dateTime, venue_name: event.venue, city: event.city || '', status: mapEventStatus(event.status), settlement_status: null, settlement_details: null, financial_summary: { total_bookings: tb, total_tickets_sold: tts, free_bookings: 0, paid_bookings: tb, gross_revenue: toMoney(gr), processing_fees: toMoney(pf), processing_fee_percentage: PFP, platform_commission: toMoney(pc), platform_commission_percentage: PCP, net_payout_to_movie_team: toMoney(np) }, bookings: eb.map((b) => ({ booking_id: String(b._id), tickets_count: b.ticketsCount, total_amount: toMoney(b.amount), booking_status: b.bookingStatus, payment_required: false, payment_status: b.paymentStatus || 'not_required', booked_at: b.createdAt })) };
  });
  const summary = eventsPayload.reduce((a, e) => { a.total_events++; a.total_tickets_sold += e.financial_summary.total_tickets_sold; a.total_gross_revenue += e.financial_summary.gross_revenue; a.total_processing_fees += e.financial_summary.processing_fees; a.total_platform_commission += e.financial_summary.platform_commission; a.total_net_payout += e.financial_summary.net_payout_to_movie_team; return a; }, { total_events: 0, total_tickets_sold: 0, total_gross_revenue: 0, total_processing_fees: 0, total_platform_commission: 0, total_net_payout: 0 });
  return res.json({ success: true, events: eventsPayload, summary: { total_events: summary.total_events, total_tickets_sold: summary.total_tickets_sold, total_gross_revenue: toMoney(summary.total_gross_revenue), total_processing_fees: toMoney(summary.total_processing_fees), total_platform_commission: toMoney(summary.total_platform_commission), total_net_payout: toMoney(summary.total_net_payout) }, fee_structure: { processing_fee_percentage: PFP, platform_commission_note: 'Commission percentage varies per event' } });
});

organizerRouter.get('/reconciliation', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  const actorId = req.user?.sub;
  if (!actorId) return res.status(401).json({ error: 'Unauthorized' });
  const events = await EventModel.find({ organizerId: actorId, status: { $in: ['published', 'checkin_open', 'in_progress', 'ended', 'closed'] } }).sort({ dateTime: -1 }).lean();
  const eventIds = events.map((e) => String(e._id));
  const bookings = await BookingModel.find({ eventId: { $in: eventIds }, bookingStatus: 'confirmed' }).lean();
  const bookingIds = bookings.map((b) => String(b._id));
  const checkins = await CheckInModel.find({ bookingId: { $in: bookingIds } }).lean();
  const eventsPayload = events.map((event) => {
    const eid = String(event._id); const eb = bookings.filter((b) => b.eventId === eid);
    const ebIds = new Set(eb.map((b) => String(b._id))); const ec = checkins.filter((c) => ebIds.has(c.bookingId));
    const tb = eb.length, tc = ec.length, ns = Math.max(0, tb - tc);
    const pb = eb.filter((b) => b.paymentStatus === 'paid').length, fb = eb.filter((b) => !b.paymentStatus).length;
    const pp = eb.filter((b) => b.paymentStatus === 'pending').length, fp = eb.filter((b) => b.paymentStatus === 'failed').length;
    const gr = eb.reduce((s, b) => s + b.amount, 0);
    let rs = 'matched', dr;
    if (pp > 0) { rs = 'pending'; dr = 'Pending payments to be resolved'; }
    if (tb > 0 && ns > tb * 0.2) { rs = 'discrepancy'; dr = 'High no-show rate (>20%)'; }
    return { event_id: eid, event_title: event.title, event_date: event.dateTime, total_bookings: tb, total_checkins: tc, no_shows: ns, paid_bookings: pb, free_bookings: fb, pending_payments: pp, failed_payments: fp, gross_revenue: toMoney(gr), reconciliation_status: rs, discrepancy_reason: dr, checkin_to_payment_ratio: tb > 0 ? Number(((tc / tb) * 100).toFixed(2)) : 0 };
  });
  const summary = { total_events: eventsPayload.length, matched_events: eventsPayload.filter((e) => e.reconciliation_status === 'matched').length, discrepancy_events: eventsPayload.filter((e) => e.reconciliation_status === 'discrepancy').length, pending_events: eventsPayload.filter((e) => e.reconciliation_status === 'pending').length, total_bookings: eventsPayload.reduce((s, e) => s + e.total_bookings, 0), total_checkins: eventsPayload.reduce((s, e) => s + e.total_checkins, 0), overall_checkin_rate: 0, discrepancies: [] };
  summary.overall_checkin_rate = summary.total_bookings > 0 ? Number(((summary.total_checkins / summary.total_bookings) * 100).toFixed(2)) : 0;
  const hns = eventsPayload.filter((e) => e.no_shows > e.total_bookings * 0.2).length;
  if (hns > 0) summary.discrepancies.push({ type: 'high_no_show', count: hns, description: 'High no-show rate detected' });
  const pp2 = eventsPayload.reduce((s, e) => s + e.pending_payments, 0);
  if (pp2 > 0) summary.discrepancies.push({ type: 'pending_payments', count: pp2, description: 'Pending payments awaiting verification' });
  return res.json({ success: true, events: eventsPayload, summary });
});

organizerRouter.get('/events/:eventId/notes', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  const actorId = req.user?.sub;
  if (!actorId) return res.status(401).json({ error: 'Unauthorized' });
  const event = await loadOrganizerEvent(actorId, req.params.eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (event === 'forbidden') return res.status(403).json({ error: 'Forbidden' });
  return res.json({ success: true, notes: event.notes || '' });
});

organizerRouter.post('/events/:eventId/notes', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  const actorId = req.user?.sub;
  if (!actorId) return res.status(401).json({ error: 'Unauthorized' });
  const event = await loadOrganizerEvent(actorId, req.params.eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (event === 'forbidden') return res.status(403).json({ error: 'Forbidden' });
  event.notes = typeof req.body?.notes === 'string' ? req.body.notes : '';
  await event.save();
  return res.json({ success: true, notes: event.notes || '' });
});

organizerRouter.get('/events/:eventId/stats', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  const actorId = req.user?.sub;
  if (!actorId) return res.status(401).json({ error: 'Unauthorized' });
  const event = await loadOrganizerEvent(actorId, req.params.eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (event === 'forbidden') return res.status(403).json({ error: 'Forbidden' });
  const [bookings, checkedInTicketsCount] = await Promise.all([BookingModel.find({ eventId: req.params.eventId, bookingStatus: { $ne: 'cancelled' } }).select('ticketsCount').lean(), TicketModel.countDocuments({ eventId: req.params.eventId, checkInStatus: 'checked_in' })]);
  const totalBooked = bookings.reduce((s, b) => s + (b.ticketsCount || 0), 0);
  const remaining = Math.max(0, event.capacity - totalBooked);
  return res.json({ success: true, totalBooked, checkedIn: checkedInTicketsCount, remaining, percentageFilled: event.capacity > 0 ? Number(((totalBooked / event.capacity) * 100).toFixed(2)) : 0, percentageCheckedIn: totalBooked > 0 ? Number(((checkedInTicketsCount / totalBooked) * 100).toFixed(2)) : 0 });
});

organizerRouter.get('/events/:eventId/checked-in-users', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  const actorId = req.user?.sub;
  if (!actorId) return res.status(401).json({ error: 'Unauthorized' });
  const event = await loadOrganizerEvent(actorId, req.params.eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (event === 'forbidden') return res.status(403).json({ error: 'Forbidden' });
  const tickets = await TicketModel.find({ eventId: req.params.eventId, checkInStatus: 'checked_in' }).sort({ checkedInAt: -1 }).lean();
  if (tickets.length === 0) return res.json({ success: true, checkedInUsers: [] });
  const bookingIds = Array.from(new Set(tickets.map((t) => t.bookingId)));
  const userIds = Array.from(new Set(tickets.map((t) => t.attendeeId)));
  const scannedByIds = Array.from(new Set(tickets.map((t) => t.checkedInBy).filter(Boolean)));
  const [bkgs, users, scanners] = await Promise.all([BookingModel.find({ _id: { $in: bookingIds } }).select('bookingCode ticketsCount').lean(), UserModel.find({ _id: { $in: userIds } }).select('fullName email phone city').lean(), UserModel.find({ _id: { $in: scannedByIds } }).select('fullName').lean()]);
  const bkgById = new Map(bkgs.map((b) => [String(b._id), b])); const userById = new Map(users.map((u) => [String(u._id), u])); const scannerById = new Map(scanners.map((u) => [String(u._id), u]));
  const tnByBooking = new Map();
  const checkedInUsers = tickets.map((t) => { const b = bkgById.get(t.bookingId); const u = userById.get(t.attendeeId); const sc = t.checkedInBy ? scannerById.get(t.checkedInBy) : null; const tn = (tnByBooking.get(t.bookingId) || 0) + 1; tnByBooking.set(t.bookingId, tn); return { ticketId: String(t._id), ticketCode: String(t._id).slice(-8).toUpperCase(), ticketNumber: tn, bookingId: t.bookingId, bookingCode: b?.bookingCode || '', checkedInAt: t.checkedInAt || new Date(), checkedInBy: sc?.fullName || 'Staff', ticketsCount: b?.ticketsCount || 1, user: { id: t.attendeeId, fullName: u?.fullName || 'Attendee', email: u?.email || '', phone: u?.phone || '', city: u?.city || '' } }; });
  return res.json({ success: true, checkedInUsers });
});

organizerRouter.post('/events/:eventId/status', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  const actorId = req.user?.sub;
  if (!actorId) return res.status(401).json({ error: 'Unauthorized' });
  const event = await loadOrganizerEvent(actorId, req.params.eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (event === 'forbidden') return res.status(403).json({ error: 'Forbidden' });
  const nextStatus = mapCheckinStatus(typeof req.body?.status === 'string' ? req.body.status : '');
  if (!nextStatus) return res.status(400).json({ error: 'Invalid status' });
  event.status = nextStatus; await event.save();
  return res.json({ success: true, status: event.status });
});

organizerRouter.post('/checkin', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  const actorId = req.user?.sub;
  if (!actorId) return res.status(401).json({ error: 'Unauthorized' });
  const eventId = typeof req.body?.eventId === 'string' ? req.body.eventId : '';
  if (!eventId) return res.status(400).json({ error: 'eventId is required' });
  const event = await loadOrganizerEvent(actorId, eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (event === 'forbidden') return res.status(403).json({ error: 'Forbidden' });
  const method = req.body?.method === 'manual' ? 'manual' : 'qr';
  let booking = null, tickets = [];
  if (method === 'qr') {
    const qrCode = typeof req.body?.qrCode === 'string' ? req.body.qrCode : '';
    if (!qrCode) return res.status(400).json({ error: 'qrCode is required' });
    let parsedQr = null; try { parsedQr = JSON.parse(qrCode); } catch { parsedQr = null; }
    const ticket = parsedQr?.ticketId ? await TicketModel.findById(parsedQr.ticketId) : await TicketModel.findOne({ eventId, qrPayload: qrCode });
    if (!ticket || ticket.eventId !== eventId) return res.status(404).json({ error: 'Ticket not found for this event' });
    booking = await BookingModel.findById(ticket.bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    const attendee = await UserModel.findById(ticket.attendeeId).lean();
    if (ticket.checkInStatus === 'checked_in') return res.status(409).json({ error: 'Ticket already checked in', isDuplicate: true, ticket: { ticketCode: String(ticket._id).slice(-8).toUpperCase(), ticketNumber: 1, bookingCode: booking.bookingCode, attendeeName: attendee?.fullName || 'Attendee', checkInTime: ticket.checkedInAt || new Date() } });
    ticket.checkInStatus = 'checked_in'; ticket.checkedInAt = new Date(); ticket.checkedInBy = actorId; await ticket.save();
    await CheckInModel.create({ ticketId: String(ticket._id), eventId, bookingId: String(booking._id), attendeeId: ticket.attendeeId, scannedBy: actorId, method: 'qr' });
    return res.json({ success: true, message: 'Check-in successful!', ticket: { ticketCode: String(ticket._id).slice(-8).toUpperCase(), ticketNumber: 1, bookingCode: booking.bookingCode, attendeeName: attendee?.fullName || 'Attendee', checkInTime: ticket.checkedInAt } });
  }
  const bookingInput = typeof req.body?.bookingId === 'string' ? req.body.bookingId.trim() : '';
  const phoneInput = typeof req.body?.phoneNumber === 'string' ? req.body.phoneNumber.trim() : '';
  if (!bookingInput && !phoneInput) return res.status(400).json({ error: 'bookingId or phoneNumber is required' });
  if (bookingInput) { booking = (await BookingModel.findOne({ eventId, bookingCode: bookingInput, bookingStatus: { $ne: 'cancelled' } })) || (await BookingModel.findOne({ _id: bookingInput, eventId, bookingStatus: { $ne: 'cancelled' } })); }
  else { const user = await UserModel.findOne({ phone: phoneInput }).select('_id').lean(); if (user?._id) booking = await BookingModel.findOne({ eventId, attendeeId: String(user._id), bookingStatus: { $ne: 'cancelled' } }); }
  if (!booking) return res.status(404).json({ error: 'Booking not found for this event' });
  tickets = await TicketModel.find({ bookingId: String(booking._id), eventId }).sort({ createdAt: 1 });
  if (tickets.length === 0) return res.status(404).json({ error: 'No tickets found for this booking' });
  const attendee = await UserModel.findById(booking.attendeeId).lean();
  if (tickets.every((t) => t.checkInStatus === 'checked_in')) { const fc = tickets.find((t) => t.checkedInAt) || tickets[0]; return res.status(409).json({ error: 'Booking already checked in', isDuplicate: true, booking: { bookingId: String(booking._id), bookingCode: booking.bookingCode, attendeeName: attendee?.fullName || 'Attendee', ticketsCount: booking.ticketsCount || tickets.length, checkInTime: fc.checkedInAt || new Date() } }); }
  const now = new Date();
  await Promise.all(tickets.filter((t) => t.checkInStatus !== 'checked_in').map(async (t) => { t.checkInStatus = 'checked_in'; t.checkedInAt = now; t.checkedInBy = actorId; await t.save(); await CheckInModel.create({ ticketId: String(t._id), eventId, bookingId: String(booking._id), attendeeId: t.attendeeId, scannedBy: actorId, method: 'manual' }); }));
  return res.json({ success: true, message: 'Check-in successful!', booking: { bookingId: String(booking._id), bookingCode: booking.bookingCode, attendeeName: attendee?.fullName || 'Attendee', ticketsCount: booking.ticketsCount || tickets.length, checkInTime: now } });
});

module.exports = { organizerRouter };
