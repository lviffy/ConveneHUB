const { Schema, model } = require('mongoose');

const orderSchema = new Schema(
  {
    userId: { type: String, required: true },
    eventId: { type: String, required: true },
    ticketId: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const OrderModel = model('Order', orderSchema);

module.exports = { OrderModel };
