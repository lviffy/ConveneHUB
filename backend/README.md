# ConveneHub Backend

Express + MongoDB API for ConveneHub.

## Overview

The backend provides role-aware APIs for authentication, events, bookings, check-ins, promoter workflows, admin operations, uploads, and payments.

- Runtime: Node.js
- Framework: Express
- Database: MongoDB via Mongoose
- Validation: Zod

## Project Layout

```text
backend/
├── src/
│   ├── server.js
│   ├── app.js
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── scripts/
│   └── backfill-role-flow-data.js
├── .env.example
└── package.json
```

## API Base Path

All API routes are mounted under:

- `/api/v1`

Examples:

- `GET /api/v1/health`
- `POST /api/v1/auth/login`
- `GET /api/v1/events`

## Route Groups

- `/api/v1/auth`
- `/api/v1/events`
- `/api/v1/bookings`
- `/api/v1/tickets`
- `/api/v1/checkins`
- `/api/v1/promoters`
- `/api/v1/analytics`
- `/api/v1/admin`
- `/api/v1/organizer`
- `/api/v1/uploads`
- `/api/v1/payments`
- `/api/v1/profile/update`
- `/api/v1/contact`

## Key Endpoints

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/google`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

### Events

- `GET /api/v1/events`
- `POST /api/v1/events`
- `GET /api/v1/events/:id`
- `PUT /api/v1/events/:id`
- `DELETE /api/v1/events/:id`
- `GET /api/v1/events/organizer/:id`

### Bookings

- `POST /api/v1/bookings`
- `GET /api/v1/bookings`
- `GET /api/v1/bookings/:id`
- `PUT /api/v1/bookings/:id`
- `DELETE /api/v1/bookings/:id`

### Check-ins

- `POST /api/v1/checkins`
- `GET /api/v1/checkins/event/:eventId`
- `GET /api/v1/checkins/:id`

### Promoters

- `POST /api/v1/promoters/track-click`
- `POST /api/v1/promoters/links`
- `GET /api/v1/promoters/links`
- `GET /api/v1/promoters/performance`
- `GET /api/v1/promoters/commissions`

### Admin

- `GET /api/v1/admin/tenants`
- `POST /api/v1/admin/tenants`
- `PUT /api/v1/admin/tenants/:id`
- `DELETE /api/v1/admin/tenants/:id`
- `GET /api/v1/admin/users`
- `PUT /api/v1/admin/users/:id/role`
- `GET /api/v1/admin/analytics`

### Payments

- `POST /api/v1/payments/create-order`
- `POST /api/v1/payments/verify`
- `POST /api/v1/payments/fail`

## Setup

### Prerequisites

- Node.js 18+
- MongoDB 6+

### Install

```bash
cd backend
npm install
cp .env.example .env
```

### Run

```bash
npm run dev
```

### Start (production)

```bash
npm run start
```

## Scripts

- `npm run dev` - Start with Node watch mode
- `npm run build` - No-op placeholder build script
- `npm run start` - Start API server
- `npm run backfill:role-flow` - Run data backfill migration

## Environment Variables

Configure `backend/.env`.

Core:

- `PORT`
- `NODE_ENV`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

Optional:

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `UPLOAD_ROOT`

## Notes

- Uploaded files are exposed from `/api/v1/uploads`.
- Role checks are enforced in middleware and route handlers.
- Keep endpoint documentation synced with `backend/src/routes`.

## License

MIT
