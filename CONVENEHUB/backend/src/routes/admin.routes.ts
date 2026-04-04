import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { UserModel } from '../models/User';
import { EventModel } from '../models/Event';

export const adminRouter = Router();

adminRouter.get('/tenants', requireAuth, requireRole('admin'), async (_req, res) => {
  const users = await UserModel.find({}, { tenantId: 1 }).lean();
  const events = await EventModel.find({}, { tenantId: 1 }).lean();

  const tenantSet = new Set<string>();
  users.forEach((u) => {
    if (u.tenantId) tenantSet.add(u.tenantId);
  });
  events.forEach((event) => {
    if (event.tenantId) tenantSet.add(event.tenantId);
  });

  return res.json({ success: true, tenants: Array.from(tenantSet) });
});

adminRouter.get('/users', requireAuth, requireRole('admin'), async (_req, res) => {
  const users = await UserModel.find({}, { passwordHash: 0 }).sort({ createdAt: -1 }).lean();
  return res.json({ success: true, users });
});
