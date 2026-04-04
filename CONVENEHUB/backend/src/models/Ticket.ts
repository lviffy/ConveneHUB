import { Schema, model } from 'mongoose';

interface TicketDocument {
  bookingId: string;
  eventId: string;
  attendeeId: string;
  qrPayload: string;
  checkInStatus: 'pending' | 'checked_in';
  checkedInAt?: Date;
  checkedInBy?: string;
}

const ticketSchema = new Schema<TicketDocument>(
  {
    bookingId: { type: String, required: true },
    eventId: { type: String, required: true },
    attendeeId: { type: String, required: true },
    qrPayload: { type: String, required: true },
    checkInStatus: { type: String, enum: ['pending', 'checked_in'], default: 'pending' },
    checkedInAt: { type: Date },
    checkedInBy: { type: String },
  },
  { timestamps: true }
);

export const TicketModel = model<TicketDocument>('Ticket', ticketSchema);
