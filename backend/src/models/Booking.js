const { Schema, model } = require('mongoose');

const bookingSchema = new Schema(
  {
    eventId: { type: String, required: true },
    // attendeeId stays as canonical field used by existing routes.
    attendeeId: { type: String, required: true, alias: 'userId' },
    ticketId: { type: String },
    tierName: { type: String, required: true },
    ticketPrice: { type: Number, required: true, min: 0 },
    ticketsCount: { type: Number, required: true, min: 1 },
    amount: { type: Number, required: true, min: 0 },
    bookingCode: { type: String, required: true, unique: true },
    bookingStatus: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'paid' },
    referralCode: { type: String },
    promoterId: { type: String },
  },
  { timestamps: true }
);

const BookingModel = model('Booking', bookingSchema);

module.exports = { BookingModel };
