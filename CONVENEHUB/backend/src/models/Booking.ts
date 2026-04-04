import { Schema, model } from 'mongoose';

interface BookingDocument {
  eventId: string;
  attendeeId: string;
  tierName: string;
  ticketPrice: number;
  ticketsCount: number;
  amount: number;
  bookingCode: string;
  bookingStatus: 'confirmed' | 'cancelled';
  referralCode?: string;
  promoterId?: string;
}

const bookingSchema = new Schema<BookingDocument>(
  {
    eventId: { type: String, required: true },
    attendeeId: { type: String, required: true },
    tierName: { type: String, required: true },
    ticketPrice: { type: Number, required: true, min: 0 },
    ticketsCount: { type: Number, required: true, min: 1 },
    amount: { type: Number, required: true, min: 0 },
    bookingCode: { type: String, required: true, unique: true },
    bookingStatus: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
    referralCode: { type: String },
    promoterId: { type: String },
  },
  { timestamps: true }
);

export const BookingModel = model<BookingDocument>('Booking', bookingSchema);
