const { Router } = require('express');
const QRCode = require('qrcode');
const { requireAuth } = require('../middlewares/auth.middleware');
const { TicketModel } = require('../models/Ticket');
const { BookingModel } = require('../models/Booking');

const ticketsRouter = Router();

ticketsRouter.get('/:id/qr', requireAuth, async (req, res) => {
  const ticket = await TicketModel.findById(req.params.id).lean();
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  const booking = await BookingModel.findById(ticket.bookingId).lean();
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  if (req.user?.role !== 'admin' && booking.attendeeId !== req.user?.sub) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const qrDataUrl = await QRCode.toDataURL(ticket.qrPayload, { width: 512, margin: 1 });
  return res.json({ success: true, ticketId: String(ticket._id), qrCode: qrDataUrl, qr_code: qrDataUrl });
});

module.exports = { ticketsRouter };
