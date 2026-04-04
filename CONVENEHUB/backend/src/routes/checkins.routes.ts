import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { TicketModel } from '../models/Ticket';
import { CheckInModel } from '../models/CheckIn';

export const checkinsRouter = Router();

const qrCheckinSchema = z.object({
  qrPayload: z.string().min(1),
});

const manualCheckinSchema = z.object({
  ticketId: z.string().min(1),
});

async function processCheckin(ticketId: string, scannedBy: string, method: 'qr' | 'manual') {
  const ticket = await TicketModel.findById(ticketId);
  if (!ticket) {
    return { status: 404 as const, body: { success: false, message: 'Ticket not found' } };
  }

  if (ticket.checkInStatus === 'checked_in') {
    return { status: 409 as const, body: { success: false, message: 'Ticket already checked in' } };
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

  return { status: 200 as const, body: { success: true, ticket } };
}

checkinsRouter.post('/qr', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  const parsed = qrCheckinSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Invalid qr payload' });
  }

  let payload: { ticketId?: string } = {};
  try {
    payload = JSON.parse(parsed.data.qrPayload) as { ticketId?: string };
  } catch {
    return res.status(400).json({ success: false, message: 'QR payload is not valid JSON' });
  }

  if (!payload.ticketId) {
    return res.status(400).json({ success: false, message: 'QR payload missing ticketId' });
  }

  const result = await processCheckin(payload.ticketId, req.user!.sub, 'qr');
  return res.status(result.status).json(result.body);
});

checkinsRouter.post('/manual', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  const parsed = manualCheckinSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Invalid ticket id' });
  }

  const result = await processCheckin(parsed.data.ticketId, req.user!.sub, 'manual');
  return res.status(result.status).json(result.body);
});

checkinsRouter.get('/event/:eventId', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  const checkins = await CheckInModel.find({ eventId: req.params.eventId }).sort({ createdAt: -1 }).lean();
  return res.json({ success: true, checkins });
});
