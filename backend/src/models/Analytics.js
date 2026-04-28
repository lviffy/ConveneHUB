const { Schema, model } = require('mongoose');

const analyticsSchema = new Schema(
  {
    eventId: { type: String, required: true, unique: true },
    revenue: { type: Number, min: 0, default: 0 },
    attendance: { type: Number, min: 0, default: 0 },
    promoterPerformance: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
);

const AnalyticsModel = model('Analytics', analyticsSchema);

module.exports = { AnalyticsModel };
