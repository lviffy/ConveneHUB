const { Router } = require('express');
const { z } = require('zod');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');
const { UserModel } = require('../models/User');

const miscRouter = Router();

const profileUpdateSchema = z.object({
  full_name: z.string().min(2).max(120).optional(),
  city: z.string().max(120).optional(),
  phone: z.string().max(40).optional(),
});

const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  subject: z.string().min(2).max(200),
  message: z.string().min(2).max(5000),
});

miscRouter.post('/profile/update', requireAuth, async (req, res) => {
  const parsed = profileUpdateSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || 'Invalid payload' });
  }

  const userId = req.user?.sub;
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const update = {};
  if (parsed.data.full_name !== undefined) update.fullName = parsed.data.full_name.trim();
  if (parsed.data.city !== undefined) update.city = parsed.data.city.trim();
  if (parsed.data.phone !== undefined) update.phone = parsed.data.phone.trim();

  const user = await UserModel.findByIdAndUpdate(userId, update, { new: true }).lean();
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  return res.json({
    success: true,
    profile: {
      id: String(user._id),
      full_name: user.fullName,
      city: user.city || '',
      phone: user.phone || '',
    },
  });
});

miscRouter.post('/contact', async (req, res) => {
  const parsed = contactSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || 'Invalid payload' });
  }

  return res.json({
    success: true,
    message: 'Contact message received',
    received_at: new Date().toISOString(),
  });
});

module.exports = { miscRouter };
