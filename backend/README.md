# ConveneHub Backend

<div align="center">

**The Express + TypeScript backend for ConveneHub event management platform**

[![Express](https://img.shields.io/badge/Express-4.21-000000)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.8-47A248)](https://www.mongodb.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933)](https://nodejs.org/)

</div>

---

## Overview

The ConveneHub backend is a RESTful API built with Express, TypeScript, and MongoDB. It provides secure authentication, role-based access control, and comprehensive event management capabilities.

## Features

- **Multi-Role Authentication** — JWT-based auth with role enforcement
- **Event Management** — CRUD operations for events with ticket tiers
- **Booking System** — Attendee booking flow with QR code generation
- **Check-in System** — Real-time check-in validation
- **Referral Program** — Promoter links with commission tracking
- **Tenant Management** — Multi-tenancy support
- **Email Notifications** — SMTP integration for transactional emails
- **Rate Limiting** — API rate limiting for protection
- **Security** — Helmet, CORS, and input validation

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Express 4.21 |
| **Language** | TypeScript 5.8 |
| **Database** | MongoDB 8.8 (via Mongoose) |
| **Authentication** | JWT (jsonwebtoken) |
| **Validation** | Zod |
| **Password Hashing** | bcryptjs |
| **Email** | Nodemailer |
| **QR Code** | qrcode |
| **Payments** | Razorpay |
| **Security** | Helmet, CORS, express-rate-limit |
| **Logging** | Morgan |
| **Dev Tools** | tsx |

## Project Structure

```
backend/
├── src/
│   ├── server.ts             # Application entry point
│   ├── config/               # Configuration files
│   │   ├── database.ts       # MongoDB connection
│   │   └── index.ts          # Environment config
│   ├── models/               # Mongoose models
│   │   ├── User.ts
│   │   ├── Event.ts
│   │   ├── Booking.ts
│   │   ├── Ticket.ts
│   │   ├── Attendee.ts
│   │   ├── ReferralLink.ts
│   │   ├── Commission.ts
│   │   ├── Tenant.ts
│   │   └── Checkin.ts
│   ├── routes/               # API route definitions
│   │   ├── auth.ts
│   │   ├── events.ts
│   │   ├── bookings.ts
│   │   ├── checkins.ts
│   │   ├── referrallinks.ts
│   │   ├── commissions.ts
│   │   └── admin.ts
│   ├── controllers/          # Route controllers
│   ├── middleware/           # Custom middleware
│   │   ├── auth.ts           # Authentication middleware
│   │   ├── rbac.ts           # Role-based access control
│   │   └── errorHandler.ts   # Error handling
│   ├── services/             # Business logic
│   │   ├── email.ts          # Email service
│   │   ├── qr.ts             # QR code generation
│   │   └── payment.ts        # Payment processing
│   └── types/                # TypeScript types
├── scripts/                  # Utility scripts
│   └── backfill-role-flow-data.ts
├── uploads/                  # File upload directory
├── dist/                     # Compiled JavaScript
├── .env                      # Environment variables
├── .env.example              # Environment template
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 6.0+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Environment Variables

Configure your environment in `.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/convenehub

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# SMTP (Email)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=noreply@convenehub.com

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5173/auth/google/callback

# Razorpay (Payments)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# File Uploads
UPLOAD_ROOT=./uploads
MAX_FILE_SIZE=5242880
```

### Development

```bash
# Start development server with hot reload
npm run dev

# The API will be available at http://localhost:3000
```

### Production

```bash
# Build the project
npm run build

# Start production server
npm start
```

### Type Checking

```bash
# Run TypeScript type checker
npm run typecheck
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with tsx watch |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run start` | Start production server |
| `npm run typecheck` | Run TypeScript type checker |
| `npm run backfill:role-flow` | Run database migration script |

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/google` | Google OAuth login |
| GET | `/api/auth/me` | Get current user profile |
| POST | `/api/auth/refresh` | Refresh JWT token |
| POST | `/api/auth/logout` | Logout user |

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List all events |
| POST | `/api/events` | Create an event (organizer/admin) |
| GET | `/api/events/:id` | Get event details |
| PUT | `/api/events/:id` | Update event (owner/admin) |
| DELETE | `/api/events/:id` | Delete event (owner/admin) |
| GET | `/api/events/organizer/:id` | Get events by organizer |

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create a booking (attendee/admin) |
| GET | `/api/bookings` | List user bookings |
| GET | `/api/bookings/:id` | Get booking details |
| PUT | `/api/bookings/:id` | Update booking |
| DELETE | `/api/bookings/:id` | Cancel booking |

### Check-ins

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/checkins` | Check in an attendee (organizer/admin) |
| GET | `/api/checkins/event/:eventId` | Get event check-ins |
| GET | `/api/checkins/:id` | Get check-in details |

### Referral Links

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/referrallinks` | Create referral link (promoter) |
| GET | `/api/referrallinks` | List referral links |
| GET | `/api/referrallinks/:id` | Get referral link details |
| GET | `/api/referrallinks/code/:code` | Get link by code |

### Commissions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/commissions` | View commission earnings (promoter) |
| GET | `/api/commissions/:id` | Get commission details |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/tenants` | List all tenants |
| POST | `/api/admin/tenants` | Create a tenant |
| PUT | `/api/admin/tenants/:id` | Update tenant |
| DELETE | `/api/admin/tenants/:id` | Delete tenant |
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/:id/role` | Update user role |
| GET | `/api/admin/analytics` | Get platform analytics |

## Database Schema

### Collections

| Collection | Description |
|------------|-------------|
| `users` | User accounts with role assignments |
| `events` | Event details and metadata |
| `bookings` | Booking records |
| `tickets` | Ticket instances |
| `attendees` | Attendee profiles and data |
| `referrallinks` | Promoter referral links |
| `commissions` | Commission records for promoters |
| `tenants` | Tenant/organization records |
| `checkins` | Check-in event logs |

### Key Relationships

- Events belong to Organizers (via `createdBy`)
- Bookings belong to Attendees and Events
- Tickets belong to Bookings
- Check-ins belong to Tickets and Events
- Referral Links belong to Promoters and Events
- Commissions belong to Promoters and Bookings

## Authentication & Authorization

### JWT Flow

1. User logs in → Server generates JWT
2. JWT includes user ID and role
3. Client sends JWT in Authorization header
4. Middleware validates JWT and attaches user to request

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| `admin` | Full system access, manage tenants and users |
| `organizer` | Create/manage own events, view own analytics |
| `promoter` | Create referral links, view commissions |
| `attendee` | Book tickets, view own bookings |

## Security Features

- **Password Hashing** — bcryptjs for secure password storage
- **JWT Authentication** — Stateless token-based auth
- **Rate Limiting** — API rate limiting to prevent abuse
- **Helmet** — Security headers for Express
- **CORS** — Cross-Origin Resource Sharing configuration
- **Input Validation** — Zod schemas for request validation
- **SQL Injection Prevention** — Mongoose parameterized queries
- **XSS Protection** — Input sanitization

## Error Handling

The API uses a centralized error handler that returns:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

Common error codes:
- `AUTH_FAILED` — Authentication failed
- `UNAUTHORIZED` — User not authorized
- `FORBIDDEN` — Insufficient permissions
- `NOT_FOUND` — Resource not found
- `VALIDATION_ERROR` — Input validation failed
- `INTERNAL_ERROR` — Server error

## Migration Scripts

### Role Flow Backfill

Run the migration script to align existing data with the current role flow model:

```bash
npm run backfill:role-flow
```

This script:
- Syncs indexes for `attendees`, `referrallinks`, and `tenants`
- Creates tenant records from existing users/events
- Assigns `default-tenant` to admin/organizer users without one
- Backfills attendee records from confirmed bookings and tickets

## Testing

```bash
# Run type checking
npm run typecheck

# Build the project
npm run build
```

## Deployment

### Environment Setup

1. Set all required environment variables
2. Ensure MongoDB is accessible
3. Configure SMTP for email notifications
4. Set `NODE_ENV=production`

### Recommended Platforms

- **Railway** — Easy deployment with MongoDB
- **Render** — Free tier available
- **AWS** — Full control and scalability
- **DigitalOcean** — Simple and affordable

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Monitoring & Logging

- **Morgan** — HTTP request logging
- **Console** — Development logging
- **Error Tracking** — Centralized error handling

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new code
3. Add JSDoc comments for complex functions
4. Write tests for new features
5. Run `npm run typecheck` before committing

## License

MIT License — see the main project LICENSE file for details.

---

**Built with ❤️ by the ConveneHub Team**
