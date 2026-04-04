import { Schema, model } from 'mongoose';
import { UserRole } from '../types/common';

interface UserDocument {
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  tenantId?: string;
  campusId?: string;
  phone?: string;
  city?: string;
}

const userSchema = new Schema<UserDocument>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'organizer', 'promoter', 'attendee'], default: 'attendee' },
    tenantId: { type: String },
    campusId: { type: String },
    phone: { type: String },
    city: { type: String },
  },
  { timestamps: true }
);

export const UserModel = model<UserDocument>('User', userSchema);
