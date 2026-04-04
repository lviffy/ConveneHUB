import { Schema, model } from 'mongoose';

interface CheckInDocument {
  ticketId: string;
  eventId: string;
  bookingId: string;
  attendeeId: string;
  scannedBy: string;
  method: 'qr' | 'manual';
}

const checkInSchema = new Schema<CheckInDocument>(
  {
    ticketId: { type: String, required: true },
    eventId: { type: String, required: true },
    bookingId: { type: String, required: true },
    attendeeId: { type: String, required: true },
    scannedBy: { type: String, required: true },
    method: { type: String, enum: ['qr', 'manual'], required: true },
  },
  { timestamps: true }
);

export const CheckInModel = model<CheckInDocument>('CheckIn', checkInSchema);
