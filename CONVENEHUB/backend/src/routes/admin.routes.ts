import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { UserModel } from '../models/User';
import { EventModel } from '../models/Event';
import { BookingModel } from '../models/Booking';
import { CheckInModel } from '../models/CheckIn';
import { CouponModel } from '../models/Coupon';
import { MovieTeamAssignmentModel } from '../models/MovieTeamAssignment';
import { TenantModel } from '../models/Tenant';
import { z } from 'zod';
import { syncTenantRecord } from '../utils/tenants';

export const adminRouter = Router();

const couponCreateSchema = z.object({
  code: z.string().min(3),
  discountType: z.enum(['percentage', 'fixed', 'free']),
  discountValue: z.number(),
  eventIds: z.array(z.string()).min(1),
  usageLimit: z.number().int().positive().nullable().optional(),
  perUserLimit: z.number().int().positive().optional(),
  minTickets: z.number().int().positive().optional(),
  validFrom: z.string().nullable().optional(),
  validUntil: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

const couponUpdateSchema = z.object({
  code: z.string().min(3).optional(),
  discountType: z.enum(['percentage', 'fixed', 'free']).optional(),
  discountValue: z.number().optional(),
  eventIds: z.array(z.string()).min(1).optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  perUserLimit: z.number().int().positive().optional(),
  minTickets: z.number().int().positive().optional(),
  validFrom: z.string().nullable().optional(),
  validUntil: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

const createAssignmentSchema = z.object({
  userId: z.string().min(1),
  eventId: z.string().min(1),
});

const deleteAssignmentSchema = z.object({
  assignmentId: z.string().min(1),
});

const tenantCreateSchema = z.object({
  tenantId: z.string().min(2),
  name: z.string().min(2).optional(),
  campusId: z.string().optional(),
  adminId: z.string().optional(),
  organizerIds: z.array(z.string()).optional(),
});

const tenantUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  campusId: z.string().optional(),
  adminIds: z.array(z.string()).optional(),
  organizerIds: z.array(z.string()).optional(),
});

function mapEventStatus(status?: string) {
  if (status === 'closed') return 'ended';
  return status || 'draft';
}

function toMoney(value: number) {
  return Number(value.toFixed(2));
}

function toLegacyCoupon(coupon: any, eventById: Map<string, any>) {
  const couponEvents = (coupon.eventIds || []).map((eventId: string) => {
    const event = eventById.get(eventId);
    return {
      event_id: eventId,
      events: event
        ? {
            event_id: eventId,
            title: event.title,
          }
        : undefined,
    };
  });

  return {
    id: coupon.id,
    code: coupon.code,
    discount_type: coupon.discountType,
    discount_value: coupon.discountValue,
    event_id: coupon.eventIds?.[0] || null,
    usage_limit: coupon.usageLimit ?? null,
    per_user_limit: coupon.perUserLimit,
    min_tickets: coupon.minTickets,
    valid_from: coupon.validFrom,
    valid_until: coupon.validUntil,
    is_active: coupon.isActive,
    current_usage_count: coupon.currentUsageCount || 0,
    created_at: coupon.createdAt,
    coupon_events: couponEvents,
  };
}

adminRouter.get('/tenants', requireAuth, requireRole('admin'), async (_req, res) => {
  const [tenants, users, events] = await Promise.all([
    TenantModel.find({}).sort({ createdAt: -1 }).lean(),
    UserModel.find({}, { tenantId: 1, role: 1 }).lean(),
    EventModel.find({}, { tenantId: 1 }).lean(),
  ]);

  const tenantsPayload = tenants.map((tenant) => ({
    id: String(tenant._id),
    tenantId: tenant.tenantId,
    name: tenant.name,
    campusId: tenant.campusId,
    adminIds: tenant.adminIds || [],
    organizerIds: tenant.organizerIds || [],
    organizerCount: users.filter((user) => user.tenantId === tenant.tenantId && user.role === 'organizer').length,
    attendeeCount: users.filter((user) => user.tenantId === tenant.tenantId && user.role === 'attendee').length,
    promoterCount: users.filter((user) => user.tenantId === tenant.tenantId && user.role === 'promoter').length,
    eventCount: events.filter((event) => event.tenantId === tenant.tenantId).length,
    createdAt: (tenant as any).createdAt,
  }));

  return res.json({
    success: true,
    tenants: tenantsPayload,
    tenantIds: tenantsPayload.map((tenant) => tenant.tenantId),
  });
});

adminRouter.post('/tenants', requireAuth, requireRole('admin'), async (req, res) => {
  const parsed = tenantCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message || 'Invalid tenant payload' });
  }

  const existing = await TenantModel.findOne({ tenantId: parsed.data.tenantId.trim() }).lean();
  if (existing) {
    return res.status(409).json({ success: false, message: 'Tenant already exists' });
  }

  const tenant = await syncTenantRecord({
    tenantId: parsed.data.tenantId,
    campusId: parsed.data.campusId,
    name: parsed.data.name,
    adminId: parsed.data.adminId,
  });

  if (parsed.data.organizerIds?.length) {
    await TenantModel.findOneAndUpdate(
      { tenantId: parsed.data.tenantId.trim() },
      { $addToSet: { organizerIds: { $each: parsed.data.organizerIds } } },
      { new: true }
    );
  }

  return res.status(201).json({ success: true, tenant });
});

adminRouter.patch('/tenants/:tenantId', requireAuth, requireRole('admin'), async (req, res) => {
  const parsed = tenantUpdateSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message || 'Invalid tenant payload' });
  }

  const update: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) update.name = parsed.data.name;
  if (parsed.data.campusId !== undefined) update.campusId = parsed.data.campusId;
  if (parsed.data.adminIds !== undefined) update.adminIds = parsed.data.adminIds;
  if (parsed.data.organizerIds !== undefined) update.organizerIds = parsed.data.organizerIds;

  const tenant = await TenantModel.findOneAndUpdate(
    { tenantId: req.params.tenantId },
    update,
    { new: true }
  ).lean();

  if (!tenant) {
    return res.status(404).json({ success: false, message: 'Tenant not found' });
  }

  return res.json({ success: true, tenant });
});

adminRouter.get('/users', requireAuth, requireRole('admin'), async (_req, res) => {
  const users = await UserModel.find({}, { passwordHash: 0 }).sort({ createdAt: -1 }).lean();
  return res.json({ success: true, users });
});

adminRouter.get('/coupons', requireAuth, requireRole('admin'), async (_req, res) => {
  const coupons = await CouponModel.find({}).sort({ createdAt: -1 }).lean();
  const eventIds = Array.from(
    new Set(coupons.flatMap((coupon) => coupon.eventIds || []).filter(Boolean))
  );
  const events = await EventModel.find({ _id: { $in: eventIds } }, { title: 1 }).lean();
  const eventById = new Map(events.map((event) => [String(event._id), event]));

  return res.json({
    success: true,
    coupons: coupons.map((coupon) => toLegacyCoupon(coupon, eventById)),
  });
});

adminRouter.post('/coupons', requireAuth, requireRole('admin'), async (req, res) => {
  const parsed = couponCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid coupon payload' });
  }

  const code = parsed.data.code.trim().toUpperCase();
  const existing = await CouponModel.findOne({ code }).lean();
  if (existing) {
    return res.status(409).json({ error: 'Coupon code already exists' });
  }

  const latestCoupon = await CouponModel.findOne({}, { id: 1 }).sort({ id: -1 }).lean();
  const nextId = (latestCoupon?.id || 0) + 1;

  const coupon = await CouponModel.create({
    id: nextId,
    code,
    discountType: parsed.data.discountType,
    discountValue: parsed.data.discountType === 'free' ? 100 : parsed.data.discountValue,
    eventIds: parsed.data.eventIds,
    usageLimit: parsed.data.usageLimit ?? null,
    perUserLimit: parsed.data.perUserLimit ?? 1,
    minTickets: parsed.data.minTickets ?? 1,
    validFrom: parsed.data.validFrom ? new Date(parsed.data.validFrom) : null,
    validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : null,
    isActive: parsed.data.isActive ?? true,
    currentUsageCount: 0,
    createdBy: req.user?.sub,
  });

  const eventById = new Map<string, any>();
  const mappedCoupon = toLegacyCoupon(coupon.toObject(), eventById);
  return res.status(201).json({ success: true, coupon: mappedCoupon });
});

adminRouter.patch('/coupons/:couponId', requireAuth, requireRole('admin'), async (req, res) => {
  const parsed = couponUpdateSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid coupon payload' });
  }

  const couponId = Number(req.params.couponId);
  if (Number.isNaN(couponId)) {
    return res.status(400).json({ error: 'Invalid coupon id' });
  }

  const update: Record<string, unknown> = {};
  if (parsed.data.code !== undefined) update.code = parsed.data.code.trim().toUpperCase();
  if (parsed.data.discountType !== undefined) update.discountType = parsed.data.discountType;
  if (parsed.data.discountValue !== undefined) update.discountValue = parsed.data.discountValue;
  if (parsed.data.eventIds !== undefined) update.eventIds = parsed.data.eventIds;
  if (parsed.data.usageLimit !== undefined) update.usageLimit = parsed.data.usageLimit;
  if (parsed.data.perUserLimit !== undefined) update.perUserLimit = parsed.data.perUserLimit;
  if (parsed.data.minTickets !== undefined) update.minTickets = parsed.data.minTickets;
  if (parsed.data.validFrom !== undefined) update.validFrom = parsed.data.validFrom ? new Date(parsed.data.validFrom) : null;
  if (parsed.data.validUntil !== undefined) update.validUntil = parsed.data.validUntil ? new Date(parsed.data.validUntil) : null;
  if (parsed.data.isActive !== undefined) update.isActive = parsed.data.isActive;

  if (parsed.data.discountType === 'free') {
    update.discountValue = 100;
  }

  const coupon = await CouponModel.findOneAndUpdate({ id: couponId }, update, { new: true }).lean();
  if (!coupon) {
    return res.status(404).json({ error: 'Coupon not found' });
  }

  const eventIds = coupon.eventIds || [];
  const events = await EventModel.find({ _id: { $in: eventIds } }, { title: 1 }).lean();
  const eventById = new Map(events.map((event) => [String(event._id), event]));
  return res.json({ success: true, coupon: toLegacyCoupon(coupon, eventById) });
});

adminRouter.delete('/coupons/:couponId', requireAuth, requireRole('admin'), async (req, res) => {
  const couponId = Number(req.params.couponId);
  if (Number.isNaN(couponId)) {
    return res.status(400).json({ error: 'Invalid coupon id' });
  }

  const deleted = await CouponModel.findOneAndDelete({ id: couponId }).lean();
  if (!deleted) {
    return res.status(404).json({ error: 'Coupon not found' });
  }

  return res.json({ success: true, message: 'Coupon deleted successfully' });
});

adminRouter.get('/movie-team-assignments', requireAuth, requireRole('admin'), async (_req, res) => {
  const assignments = await MovieTeamAssignmentModel.find({}).sort({ createdAt: -1 }).lean();

  const userIds = Array.from(new Set(assignments.map((assignment) => assignment.userId)));
  const eventIds = Array.from(new Set(assignments.map((assignment) => assignment.eventId)));

  const [users, events] = await Promise.all([
    UserModel.find({ _id: { $in: userIds } }, { fullName: 1, role: 1, city: 1, email: 1 }).lean(),
    EventModel.find({ _id: { $in: eventIds } }, { title: 1, city: 1, dateTime: 1, status: 1 }).lean(),
  ]);

  const userById = new Map(users.map((user) => [String(user._id), user]));
  const eventById = new Map(events.map((event) => [String(event._id), event]));

  const payload = assignments.map((assignment) => {
    const user = userById.get(assignment.userId);
    const event = eventById.get(assignment.eventId);
    return {
      assignment_id: String(assignment._id),
      event_id: assignment.eventId,
      user_id: assignment.userId,
      assigned_at: (assignment as any).createdAt,
      user_name: user?.fullName || 'Unknown',
      user_full_name: user?.fullName || 'Unknown',
      user_city: user?.city || '',
      user_role: user?.role || 'attendee',
      event_title: event?.title || 'Unknown Event',
      event_date: event?.dateTime,
      event_date_time: event?.dateTime,
      event_city: event?.city || '',
      event_status: mapEventStatus(event?.status),
    };
  });

  return res.json({ success: true, assignments: payload });
});

adminRouter.post('/movie-team-assignments', requireAuth, requireRole('admin'), async (req, res) => {
  const parsed = createAssignmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid assignment payload' });
  }

  const [user, event] = await Promise.all([
    UserModel.findById(parsed.data.userId).lean(),
    EventModel.findById(parsed.data.eventId).lean(),
  ]);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (user.role !== 'organizer') {
    return res.status(400).json({ error: 'User is not an event operations member' });
  }

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  try {
    const assignment = await MovieTeamAssignmentModel.create({
      userId: parsed.data.userId,
      eventId: parsed.data.eventId,
      assignedBy: req.user?.sub,
    });

    return res.status(201).json({
      success: true,
      assignmentId: String(assignment._id),
      message: 'Movie team member assigned successfully',
    });
  } catch {
    return res.status(409).json({ error: 'Member is already assigned to this event' });
  }
});

adminRouter.delete('/movie-team-assignments', requireAuth, requireRole('admin'), async (req, res) => {
  const parsed = deleteAssignmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid assignment payload' });
  }

  const deleted = await MovieTeamAssignmentModel.findByIdAndDelete(parsed.data.assignmentId).lean();
  if (!deleted) {
    return res.status(404).json({ error: 'Assignment not found' });
  }

  return res.json({ success: true, message: 'Assignment removed successfully' });
});

adminRouter.get('/financial-summary', requireAuth, requireRole('admin'), async (_req, res) => {
  const PROCESSING_FEE_PERCENTAGE = 0;
  const PLATFORM_COMMISSION_PERCENTAGE = 10;

  const events = await EventModel.find({ status: { $in: ['published', 'closed'] } })
    .sort({ dateTime: -1 })
    .lean();

  if (events.length === 0) {
    return res.json({
      success: true,
      events: [],
      summary: {
        total_events: 0,
        total_tickets_sold: 0,
        total_gross_revenue: 0,
        total_processing_fees: 0,
        total_platform_commission: 0,
        total_net_payout: 0,
      },
      fee_structure: {
        processing_fee_percentage: PROCESSING_FEE_PERCENTAGE,
        platform_commission_note: 'Commission percentage varies per event',
      },
    });
  }

  const eventIds = events.map((event) => String(event._id));
  const [bookings, assignments, users] = await Promise.all([
    BookingModel.find({ eventId: { $in: eventIds }, bookingStatus: 'confirmed' }).sort({ createdAt: -1 }).lean(),
    MovieTeamAssignmentModel.find({ eventId: { $in: eventIds } }).lean(),
    UserModel.find({}, { fullName: 1, role: 1 }).lean(),
  ]);

  const userById = new Map(users.map((user) => [String(user._id), user]));

  const eventsPayload = events.map((event) => {
    const eventId = String(event._id);
    const eventBookings = bookings.filter((booking) => booking.eventId === eventId);

    const totalBookings = eventBookings.length;
    const totalTicketsSold = eventBookings.reduce((sum, booking) => sum + booking.ticketsCount, 0);
    const grossRevenue = eventBookings.reduce((sum, booking) => sum + booking.amount, 0);
    const processingFees = (grossRevenue * PROCESSING_FEE_PERCENTAGE) / 100;
    const platformCommission = (grossRevenue * PLATFORM_COMMISSION_PERCENTAGE) / 100;
    const netPayout = grossRevenue - processingFees - platformCommission;

    const assignedTeamMembers = assignments
      .filter((assignment) => assignment.eventId === eventId)
      .map((assignment) => {
        const user = userById.get(assignment.userId);
        return {
          id: assignment.userId,
          full_name: user?.fullName || 'Unknown',
          role: user?.role || 'organizer',
        };
      });

    return {
      event_id: eventId,
      title: event.title,
      date_time: event.dateTime,
      venue_name: event.venue,
      city: event.city || '',
      status: mapEventStatus(event.status),
      settlement_status: null,
      settlement_details: null,
      assigned_team_members: assignedTeamMembers,
      financial_summary: {
        total_bookings: totalBookings,
        total_tickets_sold: totalTicketsSold,
        free_bookings: 0,
        paid_bookings: totalBookings,
        gross_revenue: toMoney(grossRevenue),
        processing_fees: toMoney(processingFees),
        processing_fee_percentage: PROCESSING_FEE_PERCENTAGE,
        platform_commission: toMoney(platformCommission),
        platform_commission_percentage: PLATFORM_COMMISSION_PERCENTAGE,
        net_payout_to_movie_team: toMoney(netPayout),
      },
      bookings: eventBookings.map((booking) => ({
        booking_id: String(booking._id),
        tickets_count: booking.ticketsCount,
        total_amount: toMoney(booking.amount),
        booking_status: booking.bookingStatus,
        payment_required: false,
        payment_status: booking.paymentStatus || 'not_required',
        booked_at: (booking as any).createdAt,
      })),
    };
  });

  const summary = eventsPayload.reduce(
    (acc, event) => {
      acc.total_events += 1;
      acc.total_tickets_sold += event.financial_summary.total_tickets_sold;
      acc.total_gross_revenue += event.financial_summary.gross_revenue;
      acc.total_processing_fees += event.financial_summary.processing_fees;
      acc.total_platform_commission += event.financial_summary.platform_commission;
      acc.total_net_payout += event.financial_summary.net_payout_to_movie_team;
      return acc;
    },
    {
      total_events: 0,
      total_tickets_sold: 0,
      total_gross_revenue: 0,
      total_processing_fees: 0,
      total_platform_commission: 0,
      total_net_payout: 0,
    }
  );

  return res.json({
    success: true,
    events: eventsPayload,
    summary: {
      total_events: summary.total_events,
      total_tickets_sold: summary.total_tickets_sold,
      total_gross_revenue: toMoney(summary.total_gross_revenue),
      total_processing_fees: toMoney(summary.total_processing_fees),
      total_platform_commission: toMoney(summary.total_platform_commission),
      total_net_payout: toMoney(summary.total_net_payout),
    },
    fee_structure: {
      processing_fee_percentage: PROCESSING_FEE_PERCENTAGE,
      platform_commission_note: 'Commission percentage varies per event',
    },
  });
});

adminRouter.get('/reconciliation', requireAuth, requireRole('admin'), async (_req, res) => {
  const events = await EventModel.find({ status: { $in: ['published', 'closed'] } })
    .sort({ dateTime: -1 })
    .lean();

  const eventIds = events.map((event) => String(event._id));
  const bookings = await BookingModel.find({ eventId: { $in: eventIds }, bookingStatus: 'confirmed' }).lean();
  const bookingIds = bookings.map((booking) => String(booking._id));
  const checkins = await CheckInModel.find({ bookingId: { $in: bookingIds } }).lean();

  const eventsPayload = events.map((event) => {
    const eventId = String(event._id);
    const eventBookings = bookings.filter((booking) => booking.eventId === eventId);
    const eventBookingIds = new Set(eventBookings.map((booking) => String(booking._id)));
    const eventCheckins = checkins.filter((checkin) => eventBookingIds.has(checkin.bookingId));

    const totalBookings = eventBookings.length;
    const totalCheckins = eventCheckins.length;
    const noShows = Math.max(0, totalBookings - totalCheckins);
    const paidBookings = eventBookings.filter((booking) => booking.paymentStatus === 'paid').length;
    const freeBookings = eventBookings.filter((booking) => !booking.paymentStatus).length;
    const pendingPayments = eventBookings.filter((booking) => booking.paymentStatus === 'pending').length;
    const failedPayments = eventBookings.filter((booking) => booking.paymentStatus === 'failed').length;
    const grossRevenue = eventBookings.reduce((sum, booking) => sum + booking.amount, 0);

    let reconciliationStatus: 'matched' | 'discrepancy' | 'pending' = 'matched';
    let discrepancyReason: string | undefined;

    if (pendingPayments > 0) {
      reconciliationStatus = 'pending';
      discrepancyReason = 'Pending payments to be resolved';
    }

    if (totalBookings > 0 && noShows > totalBookings * 0.2) {
      reconciliationStatus = 'discrepancy';
      discrepancyReason = 'High no-show rate (>20%)';
    }

    return {
      event_id: eventId,
      event_title: event.title,
      event_date: event.dateTime,
      total_bookings: totalBookings,
      total_checkins: totalCheckins,
      no_shows: noShows,
      paid_bookings: paidBookings,
      free_bookings: freeBookings,
      pending_payments: pendingPayments,
      failed_payments: failedPayments,
      gross_revenue: toMoney(grossRevenue),
      reconciliation_status: reconciliationStatus,
      discrepancy_reason: discrepancyReason,
      checkin_to_payment_ratio: totalBookings > 0 ? Number(((totalCheckins / totalBookings) * 100).toFixed(2)) : 0,
    };
  });

  const summary = {
    total_events: eventsPayload.length,
    matched_events: eventsPayload.filter((event) => event.reconciliation_status === 'matched').length,
    discrepancy_events: eventsPayload.filter((event) => event.reconciliation_status === 'discrepancy').length,
    pending_events: eventsPayload.filter((event) => event.reconciliation_status === 'pending').length,
    total_bookings: eventsPayload.reduce((sum, event) => sum + event.total_bookings, 0),
    total_checkins: eventsPayload.reduce((sum, event) => sum + event.total_checkins, 0),
    overall_checkin_rate: 0,
    discrepancies: [] as Array<{ type: string; count: number; description: string }>,
  };

  summary.overall_checkin_rate =
    summary.total_bookings > 0 ? Number(((summary.total_checkins / summary.total_bookings) * 100).toFixed(2)) : 0;

  const highNoShowEvents = eventsPayload.filter((event) => event.no_shows > event.total_bookings * 0.2).length;
  if (highNoShowEvents > 0) {
    summary.discrepancies.push({
      type: 'high_no_show',
      count: highNoShowEvents,
      description: 'High no-show rate detected',
    });
  }

  const pendingPayments = eventsPayload.reduce((sum, event) => sum + event.pending_payments, 0);
  if (pendingPayments > 0) {
    summary.discrepancies.push({
      type: 'pending_payments',
      count: pendingPayments,
      description: 'Pending payments awaiting verification',
    });
  }

  return res.json({ success: true, events: eventsPayload, summary });
});
