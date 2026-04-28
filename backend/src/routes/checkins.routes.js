const { Router } = require('express');
const { z } = require('zod');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');
const { TicketModel } = require('../models/Ticket');
const { CheckInModel } = require('../models/CheckIn');
const { EventModel } = require('../models/Event');
const { AttendeeModel } = require('../models/Attendee');

const checkinsRouter = Router();

const qrCheckinSchema = z.object({
  qrPayload: z.string().min(1),
});

const manualCheckinSchema = z.object({
  ticketId: z.string().min(1),
});

async function processCheckin(ticketId, scannedBy, method) {
  const ticket = await TicketModel.findById(ticketId);
  if (!ticket) {
    return { status: 404, body: { success: false, message: 'Ticket not found' } };
  }

  if (ticket.checkInStatus === 'checked_in') {
    return { status: 409, body: { success: false, message: 'Ticket already checked in' } };
  }

  ticket.checkInStatus = 'checked_in';
  ticket.checkedInAt = new Date();
  ticket.checkedInBy = scannedBy;
  await ticket.save();

  await CheckInModel.create({
    ticketId: String(ticket._id),
    eventId: ticket.eventId,
    bookingId: ticket.bookingId,
    attendeeId: ticket.attendeeId,
    scannedBy,
    method,
  });

  await AttendeeModel.findOneAndUpdate(
    { eventId: ticket.eventId, attendeeId: ticket.attendeeId },
    {
      $set: {
        eventId: ticket.eventId,
        attendeeId: ticket.attendeeId,
        qrCode: ticket.qrPayload,
        checkInStatus: 'checked_in',
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return { status: 200, body: { success: true, ticket } };
}

async function canManageEvent(actorId, actorRole, eventId) {
  if (actorRole === 'admin') {
    return true;
  }

  const event = await EventModel.findById(eventId, { organizerId: 1 }).lean();
  return event?.organizerId === actorId;
}

checkinsRouter.post('/qr', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  const parsed = qrCheckinSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Invalid qr payload' });
  }

  let payload = {};
  try {
    payload = JSON.parse(parsed.data.qrPayload);
  } catch {
    return res.status(400).json({ success: false, message: 'QR payload is not valid JSON' });
  }

  if (!payload.ticketId) {
    return res.status(400).json({ success: false, message: 'QR payload missing ticketId' });
  }

  const ticket = await TicketModel.findById(payload.ticketId, { eventId: 1 }).lean();
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  const authorized = await canManageEvent(req.user.sub, req.user.role, ticket.eventId);
  if (!authorized) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const result = await processCheckin(payload.ticketId, req.user.sub, 'qr');
  return res.status(result.status).json(result.body);
});

checkinsRouter.post('/manual', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  const parsed = manualCheckinSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Invalid ticket id' });
  }

  const ticket = await TicketModel.findById(parsed.data.ticketId, { eventId: 1 }).lean();
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  const authorized = await canManageEvent(req.user.sub, req.user.role, ticket.eventId);
  if (!authorized) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const result = await processCheckin(parsed.data.ticketId, req.user.sub, 'manual');
  return res.status(result.status).json(result.body);
});

checkinsRouter.get('/event/:eventId', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  const authorized = await canManageEvent(req.user.sub, req.user.role, req.params.eventId);
  if (!authorized) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const checkins = await CheckInModel.find({ eventId: req.params.eventId }).sort({ createdAt: -1 }).lean();
  return res.json({ success: true, checkins });
});

module.exports = { checkinsRouter };
