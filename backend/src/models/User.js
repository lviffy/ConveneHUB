const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    // Keep fullName/passwordHash for existing APIs while exposing name/password aliases
    // to match the documented collection shape.
    fullName: { type: String, required: true, trim: true, alias: 'name' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, alias: 'password' },
    role: { type: String, enum: ['admin', 'organizer', 'promoter', 'attendee'], default: 'attendee' },
    tenantId: { type: String },
    campusId: { type: String },
    phone: { type: String },
    city: { type: String },
    emailVerified: { type: Boolean, default: false },
    otpCodeHash: { type: String },
    otpType: { type: String, enum: ['signup', 'email', 'recovery'] },
    otpExpiresAt: { type: Date },
    otpVerifiedAt: { type: Date },
  },
  { timestamps: true }
);

const UserModel = model('User', userSchema);

module.exports = { UserModel };
