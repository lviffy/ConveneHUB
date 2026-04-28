const { Schema, model } = require('mongoose');

const paymentAttemptSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    eventId: { type: String, required: true, index: true },
    tierName: { type: String, required: true },
    ticketPrice: { type: Number, required: true, min: 0 },
    ticketsCount: { type: Number, required: true, min: 1 },
    amount: { type: Number, required: true, min: 0 },
    bookingCode: { type: String, required: true },
    referralCode: { type: String },
    promoterId: { type: String },
    attributedAt: { type: Date },
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    status: {
      type: String,
      enum: ['created', 'paid', 'failed', 'cancelled', 'expired'],
      default: 'created',
      index: true,
    },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

const PaymentAttemptModel = model('PaymentAttempt', paymentAttemptSchema);

module.exports = { PaymentAttemptModel };
