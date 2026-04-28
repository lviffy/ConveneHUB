const { Schema, model } = require('mongoose');

const commissionSchema = new Schema(
  {
    promoterId: { type: String, required: true, alias: 'userId' },
    bookingId: { type: String, required: true },
    eventId: { type: String, required: true },
    referralCode: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  },
  { timestamps: true }
);

commissionSchema.index({ bookingId: 1 }, { unique: true });

const CommissionModel = model('Commission', commissionSchema);

module.exports = { CommissionModel };
