const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('node:path');
const { apiRouter } = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');
const { env } = require('./config/env');

function createApp() {
  const app = express();
  const uploadsDir = env.UPLOAD_ROOT;
  const legacyUploadsDir = path.resolve(__dirname, '..', 'uploads');
  const allowedOrigins = new Set(env.FRONTEND_ORIGINS);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          callback(null, true);
          return;
        }
        callback(null, allowedOrigins.has(origin));
      },
      credentials: true,
    })
  );
  app.use(morgan('dev'));
  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());
  app.use('/api/v1/uploads', express.static(uploadsDir, { maxAge: '1h' }));
  if (legacyUploadsDir !== uploadsDir) {
    app.use('/api/v1/uploads', express.static(legacyUploadsDir, { maxAge: '1h' }));
  }
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.get('/', (_req, res) => {
    res.json({ success: true, message: 'ConveneHub API running' });
  });

  app.use('/api/v1', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
