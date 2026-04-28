const { Schema, model } = require('mongoose');

const ticketTierSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    soldCount: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const eventSchema = new Schema(
  {
    tenantId: { type: String, required: true },
    campusId: { type: String },
    organizerId: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    venue: { type: String, required: true },
    city: { type: String },
    // Alias keeps "date" available for the documented schema while preserving existing APIs.
    dateTime: { type: Date, required: true, alias: 'date' },
    capacity: { type: Number, required: true, min: 1 },
    remaining: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['draft', 'published', 'checkin_open', 'in_progress', 'ended'], default: 'draft' },
    eventImage: { type: String },
    notes: { type: String, default: '' },
    entryInstructions: { type: String },
    terms: { type: String },
    settlementStatus: { type: String, enum: ['pending', 'settled'], default: 'pending' },
    settlementDetails: {
      transaction_reference: { type: String },
      transfer_date: { type: String },
      payment_method: { type: String },
      notes: { type: String },
      settled_by: { type: String },
      settled_at: { type: Date },
    },
    ticketTiers: { type: [ticketTierSchema], default: [] },
  },
  { timestamps: true }
);

const EventModel = model('Event', eventSchema);

module.exports = { EventModel };
