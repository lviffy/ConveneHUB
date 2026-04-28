const { Router } = require('express');
const { authRouter } = require('./auth.routes');
const { eventsRouter } = require('./events.routes');
const { bookingsRouter } = require('./bookings.routes');
const { ticketsRouter } = require('./tickets.routes');
const { checkinsRouter } = require('./checkins.routes');
const { promotersRouter } = require('./promoters.routes');
const { analyticsRouter } = require('./analytics.routes');
const { adminRouter } = require('./admin.routes');
const { uploadsRouter } = require('./uploads.routes');
const { organizerRouter } = require('./organizer.routes');
const { paymentsRouter } = require('./payments.routes');
const { miscRouter } = require('./misc.routes');

const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ success: true, service: 'convenehub-backend', version: '0.2.0' });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/events', eventsRouter);
apiRouter.use('/bookings', bookingsRouter);
apiRouter.use('/tickets', ticketsRouter);
apiRouter.use('/checkins', checkinsRouter);
apiRouter.use('/promoters', promotersRouter);
apiRouter.use('/analytics', analyticsRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/organizer', organizerRouter);
apiRouter.use('/uploads', uploadsRouter);
apiRouter.use('/payments', paymentsRouter);
apiRouter.use('/', miscRouter);

module.exports = { apiRouter };
