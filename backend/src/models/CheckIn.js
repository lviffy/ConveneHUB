const { Schema, model } = require('mongoose');

const checkInSchema = new Schema(
  {
    ticketId: { type: String, required: true },
    eventId: { type: String, required: true },
    bookingId: { type: String, required: true },
    attendeeId: { type: String, required: true, alias: 'userId' },
    qrCode: { type: String },
    checkInStatus: { type: String, enum: ['pending', 'checked_in'], default: 'checked_in' },
    scannedBy: { type: String, required: true },
    method: { type: String, enum: ['qr', 'manual'], required: true },
  },
  { timestamps: true }
);

const CheckInModel = model('CheckIn', checkInSchema);

module.exports = { CheckInModel };
