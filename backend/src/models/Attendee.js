const { Schema, model } = require('mongoose');

const attendeeSchema = new Schema(
  {
    eventId: { type: String, required: true },
    attendeeId: { type: String, required: true, alias: 'userId' },
    qrCode: { type: String, required: true },
    checkInStatus: { type: String, enum: ['pending', 'checked_in'], default: 'pending' },
  },
  { timestamps: true }
);

attendeeSchema.index({ eventId: 1, attendeeId: 1 }, { unique: true });

const AttendeeModel = model('Attendee', attendeeSchema);

module.exports = { AttendeeModel };
