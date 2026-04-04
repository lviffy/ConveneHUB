import { Schema, model } from 'mongoose';

export interface TicketTier {
  name: string;
  price: number;
  quantity: number;
  soldCount: number;
}

interface EventDocument {
  tenantId: string;
  campusId?: string;
  organizerId: string;
  title: string;
  description?: string;
  venue: string;
  city?: string;
  dateTime: Date;
  capacity: number;
  remaining: number;
  status: 'draft' | 'published' | 'closed';
  ticketTiers: TicketTier[];
}

const ticketTierSchema = new Schema<TicketTier>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    soldCount: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const eventSchema = new Schema<EventDocument>(
  {
    tenantId: { type: String, required: true },
    campusId: { type: String },
    organizerId: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    venue: { type: String, required: true },
    city: { type: String },
    dateTime: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1 },
    remaining: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['draft', 'published', 'closed'], default: 'draft' },
    ticketTiers: { type: [ticketTierSchema], default: [] },
  },
  { timestamps: true }
);

export const EventModel = model<EventDocument>('Event', eventSchema);
