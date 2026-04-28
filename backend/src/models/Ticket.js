const { Schema, model } = require('mongoose');

const ticketSchema = new Schema(
  {
    bookingId: { type: String, required: true },
    eventId: { type: String, required: true },
    attendeeId: { type: String, required: true },
    // Optional fields map to the documented Ticket collection shape.
    type: { type: String },
    price: { type: Number, min: 0 },
    quantity: { type: Number, min: 1 },
    qrPayload: { type: String, required: true },
    checkInStatus: { type: String, enum: ['pending', 'checked_in'], default: 'pending' },
    checkedInAt: { type: Date },
    checkedInBy: { type: String },
  },
  { timestamps: true }
);

const TicketModel = model('Ticket', ticketSchema);

module.exports = { TicketModel };
