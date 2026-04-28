# ConveneHub

ConveneHub is a multi-role event management platform for attendees, organizers, promoters, and administrators.

## Overview

The project is organized as a JavaScript monorepo with two workspace packages:

- `frontend`: React + Vite web application
- `backend`: Express + MongoDB REST API

## Core Capabilities

- Role-based authentication and authorization
- Event creation and lifecycle management
- Ticket booking and QR-based check-ins
- Promoter referral links and commission tracking
- Tenant-aware admin workflows

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express, Mongoose, Zod
- Database: MongoDB
- Auth: JWT (optional Google OAuth)
- Payments: Razorpay

## Monorepo Structure

```text
CoveneHUB/
├── frontend/
├── backend/
├── package.json
├── package-lock.json
└── bun.lock
```

## API Base Path

All backend API routes are mounted under:

- `/api/v1`

Health and root endpoints:

- `GET /` (service info)
- `GET /api/v1/health`

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB 6+

### Install

```bash
npm install
cp backend/.env.example backend/.env
```

### Run in Development

```bash
npm run dev:backend
npm run dev:frontend
```

- Backend default: `http://localhost:3000`
- Frontend default: `http://localhost:5173`

## Workspace Scripts

From the repository root:

- `npm run dev:backend` - Start backend in watch mode
- `npm run dev:frontend` - Start frontend dev server
- `npm run build` - Run backend build script
- `npm run start` - Start backend in production mode

## Backend Environment

Configure `backend/.env` with values appropriate for your environment.

Typical required keys:

- `PORT`
- `NODE_ENV`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

Optional integrations:

- SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`)
- Google OAuth (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`)
- Razorpay (`NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`)
- Upload storage (`UPLOAD_ROOT`)

## API Summary

Representative route groups:

- `/api/v1/auth`
- `/api/v1/events`
- `/api/v1/bookings`
- `/api/v1/checkins`
- `/api/v1/promoters`
- `/api/v1/admin`
- `/api/v1/payments`
- `/api/v1/uploads`

For full backend endpoint details, see `backend/README.md`.

## Deployment Notes

- Railway build uses Bun with `--frozen-lockfile`; keep `bun.lock` committed and in sync.
- If dependencies change, regenerate lockfiles before deploy:

```bash
npm install
bun install
```

## Contributing

- Keep frontend and backend docs aligned with code changes.
- Update endpoint docs when route behavior changes.
- Validate key scripts before opening a PR.

## License

MIT
