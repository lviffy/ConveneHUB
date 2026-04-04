# ConveneHub Implementation Plan (Separate React + Backend)

## 1) What Was Analyzed

Reference requirements:
- [conveneHUB.md](conveneHUB.md)

Reference implementation:
- [Eonverse/README.md](Eonverse/README.md)
- [Eonverse/API_DOCUMENTATION.md](Eonverse/API_DOCUMENTATION.md)
- [Eonverse/types/database.types.ts](Eonverse/types/database.types.ts)
- [Eonverse/app](Eonverse/app)
- [Eonverse/components](Eonverse/components)
- [Eonverse/app/api](Eonverse/app/api)

## 2) Key Analysis Findings

1. Existing Eonverse is tightly coupled to Next.js App Router + Supabase.
2. UI can be reused significantly, but routing, auth/session handling, and all data-access layers must be replaced.
3. Requirements in [conveneHUB.md](conveneHUB.md) ask for a separate React frontend and Node/Express backend with MongoDB (no Supabase).
4. Some Eonverse modules are extra relative to your requirements and should be dropped from v1:
- Supabase auth/session middleware and callbacks
- Supabase RLS-specific logic
- Supabase RPC-specific logic
- Next.js server components and API routes
- Any EONVERSE-only branding/docs/features not relevant to ConveneHub
5. Requirement-driven additions needed beyond current Eonverse model:
- Promoter referral tracking and commissions as a first-class domain
- Multi-campus/multi-tenant isolation model

## 3) Target Project Structure (New, Separate Project)

Create a new root project folder:

```text
CONVENEHUB/
  frontend/                 # React (Vite + TypeScript)
  backend/                  # Express + TypeScript + MongoDB
  shared/                   # Shared DTO/types (optional)
  docs/
    api/
    architecture/
```

Recommended stack:

Frontend:
- React + Vite + TypeScript
- React Router
- Tailwind CSS (reuse existing styles)
- Axios + TanStack Query
- React Hook Form + Zod

Backend:
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT auth (access + refresh)
- bcrypt
- Helmet + CORS + rate limiter + request validation
- Email and SMS API integration
- QR generation library

## 4) Feature Scope (From Requirements)

Mandatory for v1:
1. Organizer event management
2. Ticket tiers and online booking
3. RSVP/attendee registration
4. Promoter referral links + commission tracking
5. QR ticket generation and check-in
6. Revenue/attendance/promoter analytics
7. Multi-campus or multi-tenant support

Optional (v2+):
1. Dynamic pricing
2. AI demand prediction
3. Fraud detection
4. Mobile app for check-in staff
5. Real-time event heatmaps
6. Social media integration for promotion
7. Automated marketing campaigns

## 5) Reuse vs Rewrite Matrix

Reuse with minimal changes:
1. Most presentational UI components in [Eonverse/components/ui](Eonverse/components/ui)
2. Layout visuals, cards, forms, dashboard widgets
3. QR display UI patterns
4. Styling tokens and global CSS patterns

Refactor heavily:
1. Components that import next/link, next/image, next/navigation
2. Components directly calling Supabase client
3. Protected route logic based on Supabase session

Rewrite fully:
1. [Eonverse/app/api](Eonverse/app/api) (replace with Express modules)
2. [Eonverse/lib/supabase](Eonverse/lib/supabase)
3. Next middleware and auth callbacks
4. DB schema and server-side auth built around Supabase semantics

## 6) Domain Model for MongoDB (Initial)

Collections:
1. users
- name, email, passwordHash, role (admin/organizer/promoter/attendee)
- tenantId, campusId (optional by model)
- profile fields

2. tenants
- name, slug, settings

3. campuses
- tenantId, name, location

4. events
- tenantId, campusId, organizerId
- title, description, dateTime, venue, capacity
- status, poster/media, terms, instructions

5. ticketTiers
- eventId, name (General/VIP/Early Bird)
- price, quantity, soldCount

6. bookings
- eventId, attendeeId, tierId
- quantity, amount, bookingStatus, bookingCode
- referralCode/appliedPromoterId (optional)

7. tickets
- bookingId, eventId, attendeeId, qrPayload, qrNonce
- checkInStatus, checkedInAt, checkedInBy

8. promoters
- userId, tenantId, commissionType, commissionValue

9. referralLinks
- promoterId, eventId, code, url, clicks, conversions

10. sales
- referralLinkId, promoterId, eventId, bookingId, ticketsSold, saleAmount, commissionAmount, createdAt

11. commissions
- promoterId, bookingId, amount, status

12. analyticsSnapshots (optional)
- eventId, revenue, attendance, promoterPerformance, generatedAt

## 7) Backend API Plan (Express)

Base: /api/v1

Auth:
1. POST /auth/register
2. POST /auth/login
3. POST /auth/refresh
4. POST /auth/logout
5. POST /auth/forgot-password
6. POST /auth/reset-password

Events:
1. GET /events (public + filtered)
2. GET /events/:id
3. POST /events (organizer/admin)
4. PATCH /events/:id
5. DELETE /events/:id

Ticketing/Booking:
1. POST /bookings
2. GET /bookings/me
3. GET /bookings/:id
4. POST /bookings/:id/cancel
5. GET /tickets/:id/qr

Check-in:
1. POST /checkins/qr
2. POST /checkins/manual
3. GET /checkins/event/:eventId

Promoter:
1. POST /promoters/links
2. GET /promoters/links
3. GET /promoters/performance
4. GET /promoters/commissions

Analytics:
1. GET /analytics/event/:eventId
2. GET /analytics/organizer/:organizerId
3. GET /analytics/promoter/:promoterId

Admin:
1. Tenant/campus management
2. User/role management

## 8) Frontend App Plan (React)

Routes:
1. Public: /, /events, /events/:id, /login, /register
2. Attendee: /bookings, /profile
3. Organizer: /organizer/dashboard, /organizer/events, /organizer/analytics
4. Promoter: /promoter/dashboard, /promoter/links, /promoter/commissions
5. Admin: /admin/tenants, /admin/users

Frontend architecture:
1. src/pages for route screens
2. src/components for reusable UI (ported from Eonverse)
3. src/services/api for Axios client and domain services
4. src/store or React Query for server state
5. src/guards for role-based route protection

## 9) Migration and Implementation Phases

Phase 0: Foundation (1-2 days)
1. Create CONVENEHUB monorepo with frontend/backend
2. Setup TypeScript, linting, formatting, env strategy
3. Setup CI baseline and branch strategy

Phase 1: Backend Core (4-6 days)
1. Express app skeleton and security middleware
2. Mongo connection and base models
3. JWT auth + role middleware
4. Tenant/campus scoping middleware

Phase 2: Event + Ticketing Core (5-7 days)
1. Events, ticket tiers, bookings, tickets APIs
2. QR generation and validation logic
3. Booking confirmation and ticket issuance flow

Phase 3: Promoter and Commission Module (4-5 days)
1. Referral link generation and tracking
2. Commission computation and reporting
3. Promoter dashboard APIs

Phase 4: Frontend Porting (7-10 days)
1. Port reusable UI from Eonverse
2. Replace Next router/image/link APIs
3. Integrate Axios/React Query with Express APIs
4. Build attendee, organizer, promoter, admin flows

Phase 5: Analytics + Hardening (4-6 days)
1. Revenue, attendance, promoter metrics
2. Audit logs and monitoring
3. Rate limiting and abuse controls
4. Error handling and edge-case validation

Phase 6: Testing + Release Prep (4-6 days)
1. Unit and integration tests (backend)
2. Critical E2E tests (frontend)
3. Seed scripts, migration scripts, runbooks
4. Production deployment setup

## 10) What to Remove from Reference During Port

Do not carry over into the new app:
1. Supabase SDK usage
2. Supabase-specific auth and cookie/session flows
3. Next.js API routes and middleware
4. Supabase RLS/RPC assumptions
5. EONVERSE naming/branding where not needed

## 11) Acceptance Criteria for v1

1. Separate deployable frontend and backend
2. MongoDB is sole primary data store
3. End-to-end flow works:
- organizer creates event and tiers
- attendee books ticket and receives QR
- promoter referral tracked with commission
- check-in via QR updates attendance
- analytics show revenue + attendance + promoter stats
4. Role-based access control works for admin/organizer/promoter/attendee
5. Multi-tenant/campus data isolation is enforced

## 12) Immediate Next Execution Steps

1. Confirm v1 scope lock:
- Keep movie-team role or replace with promoter + check-in staff role
2. Scaffold CONVENEHUB/frontend and CONVENEHUB/backend
3. Start backend first (auth, users, events, bookings)
4. Start UI port in parallel for public pages and auth
