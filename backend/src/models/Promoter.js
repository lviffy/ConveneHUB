const { Schema, model } = require('mongoose');

const promoterSchema = new Schema(
  {
    userId: { type: String, required: true },
    eventId: { type: String, required: true },
    referralCode: { type: String, required: true, unique: true },
    commission: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

const PromoterModel = model('Promoter', promoterSchema);

module.exports = { PromoterModel };
