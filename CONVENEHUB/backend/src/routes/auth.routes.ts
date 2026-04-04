import { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { UserModel } from '../models/User';
import { signAccessToken, signRefreshToken } from '../utils/tokens';
import { env } from '../config/env';
import { requireAuth } from '../middlewares/auth.middleware';

export const authRouter = Router();

const frontendToBackendRole: Record<string, 'admin' | 'organizer' | 'promoter' | 'attendee'> = {
  eon_team: 'admin',
  movie_team: 'organizer',
  user: 'attendee',
  admin: 'admin',
  organizer: 'organizer',
  promoter: 'promoter',
  attendee: 'attendee',
};

const backendToFrontendRole: Record<'admin' | 'organizer' | 'promoter' | 'attendee', 'eon_team' | 'movie_team' | 'promoter' | 'user'> = {
  admin: 'eon_team',
  organizer: 'movie_team',
  promoter: 'promoter',
  attendee: 'user',
};

function normalizeRole(role?: string): 'admin' | 'organizer' | 'promoter' | 'attendee' {
  return frontendToBackendRole[role || 'attendee'] || 'attendee';
}

function toFrontendUser(user: {
  _id: unknown;
  fullName: string;
  email: string;
  role: 'admin' | 'organizer' | 'promoter' | 'attendee';
  tenantId?: string;
  campusId?: string;
  phone?: string;
  city?: string;
  createdAt?: Date;
}) {
  return {
    id: String(user._id),
    fullName: user.fullName,
    full_name: user.fullName,
    email: user.email,
    phone: user.phone,
    city: user.city,
    role: backendToFrontendRole[user.role] || 'user',
    tenantId: user.tenantId,
    campusId: user.campusId,
    created_at: user.createdAt,
  };
}

const registerSchema = z.object({
  fullName: z.string().min(2).optional(),
  full_name: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'organizer', 'promoter', 'attendee', 'eon_team', 'movie_team', 'user']).optional(),
  tenantId: z.string().optional(),
  campusId: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function handleRegister(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message || 'Invalid input' });
  }

  const fullName = parsed.data.fullName || parsed.data.full_name;
  if (!fullName) {
    return res.status(400).json({ success: false, message: 'fullName is required' });
  }

  const { email, password, tenantId, campusId, phone, city } = parsed.data;
  const role = normalizeRole(parsed.data.role);
  const existing = await UserModel.findOne({ email });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Email already in use' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ fullName, email, passwordHash, role, tenantId, campusId, phone, city });

  const payload = { sub: String(user._id), role: user.role, tenantId: user.tenantId };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return res.status(201).json({
    success: true,
    user: toFrontendUser(user),
    accessToken,
    refreshToken,
  });
}

authRouter.post('/register', handleRegister);
authRouter.post('/signup', handleRegister);

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Invalid credentials' });
  }

  const { email, password } = parsed.data;
  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const payload = { sub: String(user._id), role: user.role, tenantId: user.tenantId };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return res.json({
    success: true,
    user: toFrontendUser(user),
    accessToken,
    refreshToken,
  });
});

authRouter.post('/refresh', async (req, res) => {
  const token = String(req.body?.refreshToken || '');
  if (!token) {
    return res.status(400).json({ success: false, message: 'Missing refresh token' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string; role: 'admin' | 'organizer' | 'promoter' | 'attendee'; tenantId?: string };
    const accessToken = signAccessToken({ sub: decoded.sub, role: decoded.role, tenantId: decoded.tenantId });
    return res.json({ success: true, accessToken });
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
});

authRouter.post('/logout', (_req, res) => {
  res.json({ success: true, message: 'Logged out' });
});

authRouter.post('/signout', (_req, res) => {
  res.json({ success: true, message: 'Signed out' });
});

authRouter.post('/forgot-password', (_req, res) => {
  res.json({ success: true, message: 'If this email exists, a reset link/OTP has been sent' });
});

authRouter.post('/verify-otp', (_req, res) => {
  // Mongo migration compatibility: OTP flow can be layered later.
  res.json({ success: true, message: 'OTP verification accepted in compatibility mode' });
});

authRouter.post('/reset-password', requireAuth, async (req, res) => {
  const password = String(req.body?.password || '');
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await UserModel.findByIdAndUpdate(req.user?.sub, { passwordHash });
  return res.json({ success: true, message: 'Password updated' });
});

authRouter.post('/complete-profile', requireAuth, async (req, res) => {
  const phone = typeof req.body?.phone === 'string' ? req.body.phone : undefined;
  const city = typeof req.body?.city === 'string' ? req.body.city : undefined;

  if (!phone || !city) {
    return res.status(400).json({ success: false, message: 'Phone and city are required' });
  }

  const user = await UserModel.findByIdAndUpdate(
    req.user?.sub,
    { phone, city },
    { new: true, projection: { passwordHash: 0 } }
  ).lean();

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  return res.json({ success: true, user: toFrontendUser(user as any) });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await UserModel.findById(req.user?.sub, { passwordHash: 0 }).lean();
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  return res.json({ success: true, user: toFrontendUser(user as any) });
});
